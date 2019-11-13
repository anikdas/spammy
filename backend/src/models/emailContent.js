import * as Sequelize from 'sequelize';
import Joi from '@hapi/joi';
import debugLib from 'debug';
import addressParser from 'email-addresses';
import _ from 'lodash';

import config from '../config';
import db from '../database';
import EmailAddress from './emailAddress';
import User from './user';

const debug = debugLib('spammy: EmailContentModel');
const { Op } = Sequelize;

export default class EmailContent extends Sequelize.Model {}

EmailContent.init({
  envelope: Sequelize.STRING,
  senderIp: Sequelize.STRING,
  spamReport: Sequelize.STRING,
  subject: Sequelize.STRING,
  htmlBody: Sequelize.STRING,
  textBody: Sequelize.STRING,
}, {
  sequelize: db,
  modelName: 'emailContent',
  timestamps: true,
}, {
  freezeTableName: true,
});

EmailContent.belongsToMany(EmailAddress, {
  as: 'email',
  through: 'EmailToEmailContent',
});
EmailAddress.belongsToMany(EmailContent, {
  as: 'content',
  through: 'EmailToEmailContent',
});

/**
 * creates email content
 * @param envelope
 * @param subject
 * @param htmlBody
 * @param textBody
 * @param spamReport
 * @param senderIp
 * @returns {Promise<EmailContent>}
 */
export async function createEmailContent({
  envelope = null,
  subject = null,
  htmlBody = null,
  textBody = null,
  spamReport = null,
  senderIp = null,
}) {
  const argValidator = Joi.object({
    envelope: Joi.string().required(),
    subject: Joi.string(),
    htmlBody: Joi.string(),
    textBody: Joi.string(),
    spamReport: Joi.string(),
    senderIp: Joi.string().ip().required(),
  });

  const result = argValidator.validate(arguments[0], {
    errors: {
      escapeHtml: true,
    },
  });

  if (result.error) {
    debug('Invalid argument');
    debug(result.error);
    throw new Error('Invalid param error');
  }

  let envelopeParsed = {};

  try {
    envelopeParsed = JSON.parse(envelope);
  } catch (e) {
    debug(`error parsing envelope: ${e.message || e.toString()}`);
    debug(`envelope: ${envelope}`);
  }

  const allowedRecipients = _.filter(envelopeParsed.to, (address) => {
    let parsedEmail = null;
    try {
      parsedEmail = addressParser.parseOneAddress(address);
    } catch (e) {
      debug(`email parser error: ${e.message || e.toString()}`);
      debug(`invalid recipient: ${address}`);
      throw new Error(`invalid recipient: ${address}`);
    }

    return parsedEmail.parts.domain.semantic === config.allowedDomain;
  });

  if (allowedRecipients.length === 0) {
    throw new Error('No allowed recipient found');
  }

  let emailAddresses = [];
  try {
    emailAddresses = await EmailAddress.findAll({
      where: {
        address: {
          [Op.in]: allowedRecipients,
        },
      },
    });
  } catch (dbError) {
    debug('Error while finding email address');
    debug(`params: envelope :${envelope}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
  }

  if (emailAddresses.length === 0) {
    debug('recipient not found in database');
    debug(`params: envelope :${envelope}`);
    throw new Error('recipient not found in database');
  }

  let emailContent = null;
  try {
    emailContent = await EmailContent.create({
      envelope,
      senderIp,
      spamReport,
      subject,
      htmlBody,
      textBody,
    });
  } catch (dbError) {
    debug('Error while creating email content');
    debug(`params: argument :${JSON.stringify(arguments[0])}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('An DB error');
  }

  try {
    await db.transaction((t) => {
      const promises = _.map(emailAddresses, (emailAddress) => {
        return emailAddress.addContent(emailContent, {
          transaction: t,
        });
      });
      return Promise.all(promises);
    });
  } catch (dbError) {
    debug('Error while adding email content to email');
    debug(`params: argument :${JSON.stringify(arguments[0])}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('An DB error');
  }

  return emailContent;
}

/**
 *
 * @param userKey
 * @param page
 * @param email
 * @returns {Promise<Array(EmailContent)>}
 */
export async function getEmailContentList({ userKey = null, email = null, page = 1 }) {
  let emailAddress = null;

  try {
    emailAddress = await EmailAddress.findOne({
      where: {
        address: email,
      },
      include: [{
        model: User,
        required: true,
        as: 'user',
        where: {
          key: userKey,
        },
      }],
    });
  } catch (dbError) {
    debug('Error while getting user with email');
    debug(`params: argument :${JSON.stringify(arguments[0])}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('An DB error');
  }

  if (emailAddress === null) {
    throw new Error('data mismatch');
  }

  let emailContents = [];
  try {
    emailContents = await emailAddress.getContent({
      attributes: ['id', 'envelope', 'subject', 'createdAt'],
      offset: 20 * (page - 1),
      limit: 20,
    });
  } catch (dbError) {
    debug('Error while getting email contents');
    debug(`params: email :${JSON.stringify(emailAddress.get())}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('An DB error');
  }

  return emailContents;
}

/**
 *
 * @param userKey
 * @param page
 * @param email
 * @returns {Promise<EmailContent>}
 */
export async function getEmailContent({ userKey = null, emailContentId = null }) {
  let emailContent = null;

  try {
    emailContent = await EmailContent.findOne({
      where: {
        id: emailContentId,
      },
      include: [{
        model: EmailAddress,
        as: 'email',
        required: true,
      }],
    });
  } catch (dbError) {
    debug('Error while getting email content');
    debug(`params: argument :${JSON.stringify(arguments[0])}`);
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('An DB error');
  }

  if (emailContent === null) {
    throw new Error('data mismatch');
  }

  const emails = await emailContent.getEmail();
  debug(emails);

  return emailContent;
}
