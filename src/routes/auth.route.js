import { Router } from "express";
import {
  trimBodyObject,
  requiredFields,
  emailValidator,
  loginAuth,
} from "../middlewares/index.js";

import {
  signup,
  login,
  forgotPassword,
  compareForgotPasswordOTP,
  resetPassword,
} from "../controllers/auth.controller.js";

const authRouter = Router();

// ╔══════════════════╗
// ║      Signup      ║
// ╚══════════════════╝
authRouter
  .route("/signup")
  .post(
    trimBodyObject,
    requiredFields([
      "accountType",
      "firstName",
      "lastName",
      "companyName",
      "email",
      "phone",
      "address",
      "productType",
      "password",
    ]),
    emailValidator,
    signup
  );

// ╔═════════════════╗
// ║      Login      ║
// ╚═════════════════╝
authRouter
  .route("/login")
  .post(
    trimBodyObject,
    requiredFields(["email", "password"]),
    emailValidator,
    login
  );

// ╔═══════════════════════════╗
// ║      Forgot Password      ║
// ╚═══════════════════════════╝
authRouter
  .route("/forgot-password")
  .post(
    trimBodyObject,
    requiredFields(["email"]),
    emailValidator,
    forgotPassword
  );

// ╔═══════════════════════╗
// ║      Compare OTP      ║
// ╚═══════════════════════╝
authRouter
  .route("/verify-otp")
  .post(
    trimBodyObject,
    requiredFields(["email", "otp"]),
    compareForgotPasswordOTP
  );

// ╔══════════════════════════╗
// ║      Reset Password      ║
// ╚══════════════════════════╝
authRouter
  .route("/reset-password")
  .post(trimBodyObject, requiredFields(["email", "password"]), resetPassword);

export { authRouter };
