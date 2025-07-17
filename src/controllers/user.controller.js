import { UserModel } from "../models/user.model.js";

// ╔═════════════════════════════════╗
// ║      Get User By Custom Id      ║
// ╚═════════════════════════════════╝
export const getUserDetailsByCustomId = asyncHandler(async (req, res) => {
  const { userCustomId } = req.params;
  const user = await UserModel.findOne({ id: userCustomId }).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  if (!user) {
    throw new NotFoundException("User not found with provided custom ID.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "User fetched successfully.",
      data: user,
    })
  );
});
