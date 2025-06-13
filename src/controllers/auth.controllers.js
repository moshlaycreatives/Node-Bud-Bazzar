import { UserModel } from "../models/user.model.js";
import { asyncHandler, ApiResponce, sendEmail } from "../utils/index.js";
import { NotFoundException, UnAuthorizedException } from "../errors/index.js";
import bcrypt from "bcryptjs";

// ==============================================
// 1. Signup
// ==============================================
export const signup = asyncHandler(async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    taxId,
    password,
  } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestException("Email already exists.");
  }

  if (req.files.documents.lenght > 0) {
    req.body.companyDocuments = req.files.documents.map(
      (document) =>
        `${process.env.BACKEND_BASE_URL}/${document.path.replace(/\\/g, "/")}`
    );
  } else {
    throw new NotFoundException("Company documents are required.");
  }

  const user = await UserModel.create({
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    taxId,
    companyDocuments: req.body.companyDocuments,
    password,
  });

  const token = user.createJWT();

  const userDetails = await UserModel.findById(user._id).select(
    "-password -createdAt -updatedAt"
  );

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "Signup successful.",
      token,
      data: userDetails,
    })
  );
});

// ==============================================
// 2. Login
// ==============================================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("User not found.");
  }

  if (!(await user.comparePassword(password))) {
    throw new UnAuthorizedException("Invalid credentials.");
  }

  const token = await user.createJWT();
  const userDetails = await UserModel.findById(user._id).select(
    "-password -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "login successfull.",
      token,
      data: userDetails,
    })
  );
});

// ==============================================
// 3. Forgot Password
// ==============================================
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("User not found with this email.");

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
        message: "Reset link sent to email.",
      })
    );
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new InternalServerErrorException("Failed to send email.");
  }
});

// ==============================================
// 4. Compare Forgot Password OTP
// ==============================================
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

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "OTP verified successfully.",
    })
  );
});

// ==============================================
// 5. Reset Password
// ==============================================
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user || !user.resetPasswordOTP || !user.resetPasswordExpire) {
    throw new BadRequestException("Invalid or expired OTP.");
  }

  const isValid = await bcrypt.compare(otp, user.resetPasswordOTP);

  if (!isValid || user.resetPasswordExpire < Date.now()) {
    throw new BadRequestException("Invalid or expired OTP.");
  }

  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Password reset successfully.",
    })
  );
});

// ==============================================
// 6. Get User by ID
// ==============================================
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  if (!user) {
    throw new NotFoundException("User not found.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "User fetched successfully.",
      data: user,
    })
  );
});
