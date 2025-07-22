import { UserModel } from "../models/user.model.js";
import { asyncHandler, ApiResponce, sendEmail } from "../utils/index.js";
import {
  NotFoundException,
  UnAuthorizedException,
  BadRequestException,
  InternalServerErrorException,
  UnProcessableException,
} from "../errors/index.js";
import bcrypt from "bcryptjs";

// ╔═══════════════════╗
// ║      Sign Up      ║
// ╚═══════════════════╝
export const signup = asyncHandler(async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    productType,
    password,
  } = req.body;

  if (accountType === "ADMIN") {
    throw new UnAuthorizedException("Admin account creation is not allowed.");
  }

  if (productType === "CANNABIS" && !req.body.olccNumber) {
    throw new BadRequestException(
      "OLCC number is required for cannabis product type."
    );
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestException("Email already exists.");
  }

  const user = await UserModel.create({
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    productType,
    olccNumber: productType === "CANNABIS" ? req.body.olccNumber : "--",
    password,
    accountStatus: "PENDING",
  });

  const userDetails = await UserModel.findById(user._id).select(
    "-password -createdAt -updatedAt"
  );

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "Signup successful.",
      data: userDetails,
    })
  );
});

// ╔═════════════════╗
// ║      Login      ║
// ╚═════════════════╝
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("User not found.");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnAuthorizedException("Invalid credentials.");
  }

  if (user.accountStatus === "REJECTED") {
    throw new UnAuthorizedException(
      "Your account has been rejected. Please contact support."
    );
  } else if (user.accountStatus === "PENDING") {
    throw new UnAuthorizedException(
      "Your account is in pending state. Please wait for admin approval."
    );
  } else if (user.isBlocked) {
    throw new UnProcessableException("You account is blocked by admin.");
  }

  const token = user.createJWT();
  const userDetails = await UserModel.findById(user._id).select(
    "-password -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Login successful.",
      token,
      data: userDetails,
    })
  );
});

// ╔═══════════════════════════╗
// ║      Forgot Password      ║
// ╚═══════════════════════════╝
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("User not found with this email.");

  if (user.accountStatus === "REJECTED") {
    throw new UnAuthorizedException(
      "Your account has been rejected. Please contact support."
    );
  } else if (user.accountStatus === "PENDING") {
    throw new UnAuthorizedException(
      "Your account is in pending state. Please wait for admin approval."
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);
  user.resetPasswordOTP = hashedOtp;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Your reset OTP is <strong>${otp}</strong></p>`,
    });

    return res.status(200).json(
      new ApiResponce({
        statusCode: 200,
        message: "OTP has been sent to your email.",
      })
    );
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new InternalServerErrorException("Failed to send email.");
  }
});

// ╔═══════════════════════════════════════╗
// ║      Compare Forgot Password OTP      ║
// ╚═══════════════════════════════════════╝
export const compareForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !user.resetPasswordOTP || !user.resetPasswordExpire) {
    throw new BadRequestException("Invalid or expired OTP.");
  }

  const isValid = await bcrypt.compare(otp, user.resetPasswordOTP);

  if (!isValid || user.resetPasswordExpire < Date.now()) {
    throw new BadRequestException("Invalid or expired OTP.");
  }

  user.resetPassword = true;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpire = undefined;

  user.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "OTP verified successfully.",
    })
  );
});

// ╔══════════════════════════╗
// ║      Reset Password      ║
// ╚══════════════════════════╝
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user || !user.resetPassword) {
    throw new BadRequestException(
      "User not found or reset password not initiated."
    );
  }

  user.password = password;
  user.resetPassword = false;

  await user.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Password reset successfully.",
    })
  );
});
