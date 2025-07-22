import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { ACCOUNT_TYPE, STATUS } from "../../../constants/index.js";

export const getAccountRequests = asyncHandler(async (req, res) => {
  const users = await UserModel.find({
    accountType: { $ne: ACCOUNT_TYPE.ADMIN },
    accountStatus: STATUS.ACCOUNT.PENDING,
  }).select("-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt");

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: users.length > 0 ? "Account requests fetched successfully." : "Account requests collection is empty.",
    data: users.length > 0 ? users : [],
  }));
});
