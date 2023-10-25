import Router from 'express';
import { getService, getRole, getVisitStatus, getCompany } from '../controllers/option.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';

const router = Router();

router.get('/company', getCompany);

router.get('/service', verifyToken, verifyRoles('Admin', 'Company'), getService);

router.get('/role', verifyToken, verifyRoles('Admin', 'Company'), getRole);

router.get('/visit-status', verifyToken, verifyRoles('Admin', 'Company'), getVisitStatus);

export default router;
