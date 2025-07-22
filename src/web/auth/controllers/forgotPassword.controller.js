import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce, sendEmail } from "../../../utils/index.js";
import { NotFoundException, UnAuthorizedException, InternalServerErrorException } from "../../../errors/index.js";
import bcrypt from "bcryptjs";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("User not found with this email.");

  if (user.accountStatus === "REJECTED") {
    throw new UnAuthorizedException("Your account has been rejected. Please contact support.");
  } else if (user.accountStatus === "PENDING") {
    throw new UnAuthorizedException("Your account is in pending state. Please wait for admin approval.");
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

    return res.status(200).json(new ApiResponce({
      statusCode: 200,
      message: "OTP has been sent to your email.",
    }));
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new InternalServerErrorException("Failed to send email.");
  }
});
