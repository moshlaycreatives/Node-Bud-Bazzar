import { UserModel } from "../models/user.model.js";
import { asyncHandler, ApiResponce } from "../utils/index.js";
import { NotFoundException, BadRequestException } from "../errors/index.js";

// ╔═════════════════════════╗
// ║      Get All Users      ║
// ╚═════════════════════════╝
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserModel.find({ accountType: { $ne: "ADMIN" } }).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "All users fetched successfully.",
      data: users,
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

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new BadRequestException("Invalid account status.");
  }

  const user = await UserModel.findById(id);
  if (!user) {
    throw new NotFoundException("User not found.");
  }

  user.accountStatus = status;
  await user.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: `User account ${status.toLowerCase()} successfully.`,
    })
  );
});

// ╔═════════════════════════╗
// ║      Get All Users      ║
// ╚═════════════════════════╝
export const getAllUserss = asyncHandler(async (req, res) => {
  const users = await UserModel.find({ accountType: { $ne: "ADMIN" } }).select(
    "-password -resetPasswordOTP -resetPasswordExpire -createdAt -updatedAt"
  );

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "All users fetched successfully.",
      data: users,
    })
  );
});
