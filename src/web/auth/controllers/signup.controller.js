import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce, sendEmail } from "../../../utils/index.js";
import {
  UnAuthorizedException,
  BadRequestException,
} from "../../../errors/index.js";

export const signup = asyncHandler(async (req, res) => {
  const {
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    productType,
    password,
  } = req.body;

  if (accountType === "ADMIN") {
    throw new UnAuthorizedException("Admin account creation is not allowed.");
  }

  if (productType === "CANNABIS" && !req.body.olccNumber) {
    throw new BadRequestException("OLCC number is required for cannabis product type.");
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestException("Email already exists.");
  }

  const user = await UserModel.create({
    accountType,
    firstName,
    lastName,
    companyName,
    email,
    phone,
    address,
    productType,
    olccNumber: productType === "CANNABIS" ? req.body.olccNumber : "--",
    password,
    accountStatus: "PENDING",
  });

  const userDetails = await UserModel.findById(user._id).select("-password -createdAt -updatedAt");

  return res.status(201).json(new ApiResponce({
    statusCode: 201,
    message: "Signup successful.",
    data: userDetails,
  }));
});
