import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { BadRequestException, NotFoundException } from "../../../errors/index.js";
import { isValidObjectId } from "mongoose";

export const blockUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new BadRequestException("Provide id is not valid mongodb id.");

  const user = await UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { isBlocked: true } }
  );

  if (!user) throw new NotFoundException("User not found.");

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: `User account blocked successfully.`,
  }));
});
