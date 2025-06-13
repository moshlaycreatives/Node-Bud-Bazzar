import { Router } from "express";
import {
  trimBodyObject,
  requiredFields,
  emailValidator,
  upload,
  loginAuth,
} from "../middlewares/index.js";

import {
  signup,
  login,
  forgotPassword,
  compareForgotPasswordOTP,
  resetPassword,
  getUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

// ==============================================
// 1. Signup
// ==============================================
authRouter.post(
  "/signup",
  upload.fields([{ name: "documents" }]),
  trimBodyObject,
  requiredFields([
    "accountType",
    "firstName",
    "lastName",
    "companyName",
    "email",
    "phone",
    "address",
    "taxId",
    "password",
  ]),
  signup
);

// ==============================================
// 2. Login
// ==============================================
authRouter.post(
  "/login",
  trimBodyObject,
  requiredFields(["email", "password"]),
  emailValidator,
  login
);

// ==============================================
// 3. Forgot Password
// ==============================================
authRouter.post(
  "/forgot-password",
  trimBodyObject,
  requiredFields(["email"]),
  emailValidator,
  forgotPassword
);

// ==============================================
// 4. Compare OTP
// ==============================================
authRouter.post(
  "/compare-otp",
  trimBodyObject,
  requiredFields(["email", "otp"]),
  compareForgotPasswordOTP
);

// ==============================================
// 5. Reset Password
// ==============================================
authRouter.post(
  "/reset-password",
  trimBodyObject,
  requiredFields(["email", "password"]),
  resetPassword
);

// ==============================================
// 6. Get User by ID
// ==============================================
authRouter.get("/user/:id", loginAuth, getUser);

export { authRouter };
