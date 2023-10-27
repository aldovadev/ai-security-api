import Router from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import verifyRoles from '../middlewares/verifyRoles.js';
import { setupMLToday } from '../controllers/recognize.controller.js';

const router = Router();

router.post('/', verifyToken, verifyRoles('Company', 'Admin'), (req, res) => {
    res.send({ message: 'Recognize working!' });
});

router.post('/setup', verifyToken, verifyRoles('Company', 'Admin'), setupMLToday);

export default router;
