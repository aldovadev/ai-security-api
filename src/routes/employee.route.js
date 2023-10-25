import Router from 'express';
import { getEmployee, createEmployee, editEmployee, deleteEmployee, getEmployeeProfile } from '../controllers/employee.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';

const router = Router();

router.get('/', verifyToken, verifyRoles('Company', 'Admin'), getEmployee);

router.post('/', verifyToken, verifyRoles('Company', 'Admin'), createEmployee);

router.delete('/', verifyToken, verifyRoles('Company', 'Admin'), editEmployee);

router.patch('/', verifyToken, verifyRoles('Company', 'Admin'), deleteEmployee);

router.get('/profile/:id', verifyToken, verifyRoles('Company', 'Admin'), getEmployeeProfile);

export default router;
