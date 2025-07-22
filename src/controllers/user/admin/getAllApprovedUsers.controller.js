import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { ACCOUNT_TYPE, STATUS } from "../../../constants/index.js";

export const getAllApprovedUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find({
    accountType: { $ne: ACCOUNT_TYPE.ADMIN },
    accountStatus: STATUS.ACCOUNT.APPROVED,
    isBlocked: false,
  }).select("-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt");

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: users.length > 0 ? "All approved users fetched successfully." : "Approved users collection is empty.",
    data: users.length > 0 ? users : [],
  }));
});
