import dotenv from "dotenv";
import { UserModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ForbiddenException, NotFoundException } from "../errors/index.js";

dotenv.config();

// ╔═══════════════════════════════════╗
// ║      Middleware : Login Auth      ║
// ╚═══════════════════════════════════╝
export const loginAuth = async (req, res, next) => {
  const token = req?.headers?.authorization;

  if (!token) {
    console.error("Token must be provided.");
    throw new NotFoundException("Token must be provided.");
  }

  let payload;
  payload = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET_KEY);

  const user = await UserModel.findOne({ _id: payload.id });

  if (!user) {
    console.error("User not found by provided token");
    throw new ForbiddenException("User not found by provided token");
  }

  if (user.accountStatus === "REJECTED") {
    console.error("Your account has been rejected. Please contact support.");
    throw new ForbiddenException(
      "Your account has been rejected. Please contact support."
    );
  } else if (user.accountStatus === "PENDING") {
    console.error(
      "Your account is in pending state. Please wait for admin approval."
    );
    throw new ForbiddenException(
      "Your account is in pending state. Please wait for admin approval."
    );
  }

  console.log("Llllllllllllllllllllllllllogged In User: ", user);
  req.userId = user._id;
  req.userRole = user.accountType;
  req.loggedInUser = user;
  console.log("Logged In User: ", req.loggedInUser);

  next();
};
