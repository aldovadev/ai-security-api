import {
  handleLogin,
  handleLogout,
  handleRefreshToken,
} from "../controllers/authController.js";
import router from "./userRoute.js";

router.post("/login", handleLogin);

router.get("/logout", handleLogout);

router.get("/refresh", handleRefreshToken);

export default router;
