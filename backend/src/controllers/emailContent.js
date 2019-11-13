import debugLib from 'debug';

import {
  createEmailContent,
} from '../models/emailContent';

const debug = debugLib('spammy:controller');

export async function create(req, res) {
  let success = false;
  try {
    success = await createEmailContent(req.body);
  } catch (e) {
    debug('error in creating email content from webhook');
    debug(e.messsage ? e.messsage : 'No message');
    debug(e.stack ? e.stack : 'No stack');
  }

  if (!success) {
    res.sendStatus(400);
  } else {
    res.sendStatus(200);
  }
}

export default function () {
  throw new Error('Please import specific function');
}
