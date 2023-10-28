import Router from 'express';
import { getEmployee, createEmployeeDetail, editEmployeeDetail, deleteEmployee, getEmployeeProfile, uploadEmployeeImage } from '../controllers/employee.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';
import { uploadEmployee } from '../utils/uploadHandler.js';

const router = Router();

router.post('/', verifyToken, verifyRoles('Company', 'Admin'), createEmployeeDetail);

router.patch('/:id', verifyToken, verifyRoles('Company', 'Admin'), editEmployeeDetail);

router.post('/upload/:id', verifyToken, verifyRoles('Company', 'Admin'), uploadEmployee.single('image'), uploadEmployeeImage);

router.get('/:id', verifyToken, verifyRoles('Company', 'Admin'), getEmployee);

router.delete('/:id', verifyToken, verifyRoles('Company', 'Admin'), deleteEmployee);

router.get('/profile/:id', verifyToken, verifyRoles('Company', 'Admin'), getEmployeeProfile);

export default router;
