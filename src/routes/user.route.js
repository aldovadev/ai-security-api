import Router from 'express';
import { getUser, createUser, editUser, deleteUser, getUserProfile } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';

const router = Router();

router.get('/', verifyToken, verifyRoles('Admin'), getUser);

router.post('/', verifyToken, verifyRoles('Admin'), createUser);

router.delete('/:id', verifyToken, verifyRoles('Admin'), deleteUser);

router.patch('/:id', verifyToken, verifyRoles('Admin'), editUser);

router.get('/profile/:id', verifyToken, verifyRoles('Admin'), getUserProfile);

export default router;
