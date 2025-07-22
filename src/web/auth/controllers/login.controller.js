import { UserModel } from "../../../models/user.model.js";
import { asyncHandler, ApiResponce } from "../../../utils/index.js";
import { NotFoundException, UnAuthorizedException, UnProcessableException } from "../../../errors/index.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) throw new NotFoundException("User not found.");

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new UnAuthorizedException("Invalid credentials.");

  if (user.accountStatus === "REJECTED") {
    throw new UnAuthorizedException("Your account has been rejected. Please contact support.");
  } else if (user.accountStatus === "PENDING") {
    throw new UnAuthorizedException("Your account is in pending state. Please wait for admin approval.");
  } else if (user.isBlocked) {
    throw new UnProcessableException("You account is blocked by admin.");
  }

  const token = user.createJWT();
  const userDetails = await UserModel.findById(user._id).select("-password -createdAt -updatedAt");

  return res.status(200).json(new ApiResponce({
    statusCode: 200,
    message: "Login successful.",
    token,
    data: userDetails,
  }));
});
