import { UserModel } from "../models/user.model.js";
import { asyncHandler, ApiResponce } from "../utils/index.js";
import { NotFoundException, BadRequestException } from "../errors/index.js";
import { ACCOUNT_TYPES, STATUS } from "../constants/index.js";
import { isValidObjectId } from "mongoose";

// ╔════════════════════════════════╗
// ║      Get Account Requests      ║
// ╚════════════════════════════════╝
export const getAccountRequests = asyncHandler(async (req, res) => {
  const users = await UserModel.find({
    accountType: { $ne: ACCOUNT_TYPES.ADMIN },
    accountStatus: STATUS.ACCOUNT.PENDING,
  }).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        users.length > 0
          ? "Account requests fetched successfully."
          : "Account requests collection is empty.",
      data: users.length > 0 ? users : [],
    })
  );
});

// ╔══════════════════════════════════╗
// ║      Get All Approved Users      ║
// ╚══════════════════════════════════╝
export const getAllApprovedUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find({
    accountType: { $ne: ACCOUNT_TYPES.ADMIN },
    accountStatus: STATUS.ACCOUNT.APPROVED,
    isBlocked: false,
  }).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        users.length > 0
          ? "All approved users fetched successfully."
          : "Approved users collection is empty.",
      data: users.length > 0 ? users : [],
    })
  );
});

// ╔══════════════════════════╗
// ║      Get User By Id      ║
// ╚══════════════════════════╝
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

// ╔════════════════════════════════════════════════════╗
// ║      Update Account Status (Approve / Reject)      ║
// ╚════════════════════════════════════════════════════╝
export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("Provide id is not valid mongodb id.");
  }

  if (!Object.values(STATUS.ACCOUNT).slice(1).includes(status)) {
    throw new BadRequestException("Invalid account status.");
  }

  const user = await UserModel.findById(id);
  if (!user) {
    throw new NotFoundException("User not found.");
  }

  if (status === STATUS.ACCOUNT.REJECTED) {
    const reasonOfRejection = req?.body?.reasonOfRejection;

    if (!reasonOfRejection) {
      throw new NotFoundException(
        "Reason of rejection is required when reject account request."
      );
    }

    user.accountStatus = status;
    user.reasonOfRejection = reasonOfRejection;
    await user.save();
  } else {
    user.accountStatus = status;
    await user.save();
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: `User account ${status.toLowerCase()} successfully.`,
    })
  );
});

// ╔══════════════════════════════╗
// ║      Block User Account      ║
// ╚══════════════════════════════╝
export const blockUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("Provide id is not valid mongodb id.");
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { isBlocked: true } }
  );
  if (!user) {
    throw new NotFoundException("User not found.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: `User account blocked successfully.`,
    })
  );
});
