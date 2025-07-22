import { Router } from "express";
import { signup } from "./controllers/signup.controller.js";
import { login } from "./controllers/login.controller.js";
import { forgotPassword } from "./controllers/forgotPassword.controller.js";
import { compareForgotPasswordOTP } from "./controllers/compareOtp.controller.js";
import { resetPassword } from "./controllers/resetPassword.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", compareForgotPasswordOTP);
router.post("/reset-password", resetPassword);

export default router;
