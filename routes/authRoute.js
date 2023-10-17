import {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleCreateOTP,
  handleVerifyOTP,
} from "../controllers/authController.js";
import router from "./userRoute.js";

router.post("/auth/login", handleLogin);

router.get("/auth/logout", handleLogout);

router.get("/auth/refresh", handleRefreshToken);

router.get("/auth/create/otp/:email", handleCreateOTP);

router.post("/auth/verify/otp", handleVerifyOTP);

export default router;
