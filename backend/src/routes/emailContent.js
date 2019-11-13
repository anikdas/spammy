import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';

import {
  create,
} from '../controllers/emailContent';

const formMiddleware = multer();

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/create', formMiddleware.none(), create); // none() used for not allowing uploads
router.post('/getList', create);

export default router;
