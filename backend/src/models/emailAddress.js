import * as Sequelize from 'sequelize';
import Joi from '@hapi/joi';
import debugLib from 'debug';

import db from '../database';
import User, {
  getUserByKey,
} from './user';

const debug = debugLib('spammy: emailAddressModel');

class EmailAddress extends Sequelize.Model {}
EmailAddress.init({
  address: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
    unique: true,
  },
}, {
  sequelize: db,
  modelName: 'emailAddress',
  timestamps: true,
  freezeTableName: true,
});

User.hasMany(EmailAddress, {
  as: {
    singular: 'email',
    plural: 'emails',
  },
  foreignKey: 'userKey',
});
EmailAddress.belongsTo(User, {

});

/**
 * This function creates an EmailAddress database
 *
 * @param{String} email
 * @param{String} userKey
 * @returns {Promise<EmailAddress>}
 */
export async function createEmailAddress({ email, userKey }) {
  const argumentSchema = Joi.object({
    email: Joi.string().email().required(),
    userKey: Joi.string().required(),
  });

  const result = argumentSchema.validate(arguments[0]);
  if (result.error) {
    debug('Invalid argument');
    debug(result.error);
    throw new Error('Invalid param error');
  }

  const user = await getUserByKey({
    key: userKey,
  });

  let emailAddress = null;
  try {
    emailAddress = await EmailAddress.create({
      address: email,
    });
    await user.setEmails(emailAddress);
  } catch (dbError) {
    debug('Error while creating emailAddress entry');
    debug(`params: email :${email}`);
    debug(dbError.message || 'No error message');
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('DB Error');
  }

  debug('created new email address');
  return emailAddress;
}

/**
 * This function gets all the emails created by a user
 * @param{String} userKey
 * @returns {Promise<EmailAddress[]>}
 */
export async function getEmailsByUser({ userKey = null }) {
  const user = await getUserByKey({
    key: userKey,
  });

  if (user === null) {
    debug(`invalid userKey: ${userKey}`);
    throw new Error('invalid user');
  }

  let emailAddresses = [];
  try {
    emailAddresses = await user.getEmails();
  } catch (dbError) {
    debug('Error while getting email address by userKey');
    debug(`params: user: ${JSON.stringify(user.get({ plain: true }))}`);
    debug(dbError.message || 'No error message');
    debug(dbError.message || 'No error message');
    debug(dbError.stack || 'No error stack');
    throw new Error('DB Error');
  }

  return emailAddresses;
}

export default EmailAddress;
