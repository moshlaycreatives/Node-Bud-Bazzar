import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { BadRequestException } from "../../../errors/index.js";
import bcrypt from "bcryptjs";

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
  await user.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "OTP verified successfully.",
    })
  );
});
