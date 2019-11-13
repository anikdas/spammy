import express from 'express';
import { generateUser } from '../controllers/user';

const router = express.Router();

router.get('/generate', generateUser);

export default router;
