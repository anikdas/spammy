import debugLib from 'debug';

import config from '../config';
import {
  getEmailsByUser,
  createEmailAddress,
} from '../models/emailAddress';

const debug = debugLib('spammy:controller');

const ALLOWED_DOMAIN = config.allowedDomain;

export async function getAllEmailAddressesForUser(req, res) {
  let emailAddresses = [];
  try {
    emailAddresses = await getEmailsByUser({
      userKey: req.params.userKey,
    });
  } catch (e) {
    return res.json({
      success: false,
      message: e.message,
    });
  }

  return res.json({
    success: true,
    data: emailAddresses,
  });
}

export async function createEmailAddressForUser(req, res) {
  let emailAddress = {};
  const {
    email: emailLocalPart = null,
  } = req.body;

  if (emailLocalPart === null) {
    return res.json({
      success: false,
    });
  }
  try {
    emailAddress = await createEmailAddress({
      email: `${emailLocalPart}@${ALLOWED_DOMAIN}`,
      userKey: req.params.userKey,
    });
  } catch (error) {
    debug(`error creating email address: message: ${error.message || 'No Message'}`);
    return res.json({
      success: false,
      message: error.message || 'An error occurred',
    });
  }

  return res.json({
    success: true,
    data: emailAddress.address,
  });
}

export default function () {
  throw new Error('Please import specific function');
}
