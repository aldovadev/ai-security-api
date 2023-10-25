import { handleLogin, handleLogout, handleRefreshToken, handleCreateOTP, handleVerifyOTP } from '../controllers/auth.controller.js';
import router from './user.route.js';

router.post('/login', handleLogin);

router.get('/logout', handleLogout);

router.get('/refresh', handleRefreshToken);

router.get('/create/otp/:email', handleCreateOTP);

router.post('/verify/otp', handleVerifyOTP);

export default router;
