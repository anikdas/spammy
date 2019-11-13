import express from 'express';

import {
  getAllEmailAddressesForUser,
  createEmailAddressForUser,
} from '../controllers/emailAddress';

const router = express.Router();

router.get('/:userKey', getAllEmailAddressesForUser);
router.post('/:userKey', createEmailAddressForUser);

export default router;
