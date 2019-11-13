import debugLib from 'debug';

import {
  createUser,
} from '../models/user';

const debug = debugLib('spammy:controller');

export async function generateUser(req, res) {
  let user = null;
  try {
    user = await createUser();
  } catch (error) {
    debug(`error in creating user: ${error.message || error.toString() || 'No message'}`);
    debug('stack trace');
    debug(`${error.stack || 'No stack'}`);
    return res.sendStatus(400);
  }

  if (user === null) {
    return res.sendStatus(400);
  }

  return res.json({
    success: true,
    data: user.key,
  });
}

export default function () {
  throw new Error('Please import specific function');
}
