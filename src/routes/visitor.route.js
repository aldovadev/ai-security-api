import Router from 'express';
import { uploadVisitor } from '../utils/uploadHandler.js';
import {
    getVisitor,
    createVisitorDetail,
    editVisitorDetail,
    getVisitorProfile,
    uploadVisitorImage,
    changeVisitorImage,
    setupVisitorToday,
    changeVisitorStatus,
    deleteVisitor
} from '../controllers/visitor.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';
import verifyEmail from '../middlewares/verifyEmail.js';

const router = Router();

router.get('/', verifyToken, verifyRoles('Admin', 'Company'), getVisitor);

router.delete('/:id', verifyToken, verifyRoles('Admin', 'Company'), deleteVisitor);

router.post('/detail', verifyEmail, createVisitorDetail);

router.patch('/detail/:id', verifyToken, verifyRoles('Company'), editVisitorDetail);

router.post('/upload/:id', uploadVisitor.single('image'), verifyEmail, uploadVisitorImage);

router.patch('/upload/:id', uploadVisitor.single('image'), verifyToken, verifyRoles('Company'), changeVisitorImage);

router.get('/profile/:id', verifyToken, verifyRoles('Admin', 'Company'), getVisitorProfile);

router.post('/setup', verifyToken, verifyRoles('Admin', 'Company'), setupVisitorToday);

router.put('/status', verifyToken, verifyRoles('Company'), changeVisitorStatus);

export default router;
