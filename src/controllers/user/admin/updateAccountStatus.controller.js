import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { BadRequestException, NotFoundException } from "../../../errors/index.js";
import { STATUS } from "../../../constants/index.js";
import { isValidObjectId } from "mongoose";

export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidObjectId(id)) throw new BadRequestException("Provide id is not valid mongodb id.");
  if (!Object.values(STATUS.ACCOUNT).slice(1).includes(status)) {
    throw new BadRequestException("Invalid account status.");
  }

  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundException("User not found.");

  if (status === STATUS.ACCOUNT.REJECTED) {
    const reasonOfRejection = req?.body?.reasonOfRejection;
    if (!reasonOfRejection) {
      throw new NotFoundException("Reason of rejection is required when reject account request.");
    }
    user.accountStatus = status;
    user.reasonOfRejection = reasonOfRejection;
  } else {
    user.accountStatus = status;
  }

  await user.save();

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: `User account ${status.toLowerCase()} successfully.`,
  }));
});
