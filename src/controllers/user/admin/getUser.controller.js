import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { NotFoundException } from "../../../errors/index.js";

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.findById(id).select("-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt");

  if (!user) throw new NotFoundException("User not found.");

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: "User fetched successfully.",
    data: user,
  }));
});
