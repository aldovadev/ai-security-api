import Router from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';
import { recognizeImage, recognizeQR, setupMLToday } from '../controllers/recognize.controller.js';
import { uploadRecognize } from '../utils/uploadHandler.js';

const router = Router();

router.post('/face', verifyToken, verifyRoles('Company', 'Admin'), uploadRecognize.single('image'), recognizeImage);

router.post('/qr/:id', verifyToken, verifyRoles('Company', 'Admin'), recognizeQR);

router.post('/setup', verifyToken, verifyRoles('Company', 'Admin'), setupMLToday);

export default router;
