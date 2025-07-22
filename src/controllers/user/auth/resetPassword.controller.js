import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { BadRequestException } from "../../../errors/index.js";

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user || !user.resetPassword) {
    throw new BadRequestException("User not found or reset password not initiated.");
  }

  user.password = password;
  user.resetPassword = false;
  await user.save();

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: "Password reset successfully.",
  }));
});
