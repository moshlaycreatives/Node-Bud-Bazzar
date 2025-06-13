import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  BadRequestException,
  InternalServerErrorException,
} from "../errors/index.js";

const userSchema = new Schema(
  {
    accountType: {
      type: String,
      enum: ["ADMIN", "SELLER", "BUYER"],
      required: [true, "Account type is required."],
      index: true,
    },

    accountStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
      index: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
    },

    companyName: {
      type: String,
      required: [true, "Company Name is required."],
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
    },

    taxId: {
      type: String,
      required: [true, "Tax id is required."],
      trim: true,
    },

    companyDocuments: [
      {
        type: String,
        required: [true, "Company Documents are required."],
        trim: true,
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required."],
    },

    resetPasswordOTP: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

// ==============================================
// 1. Hash password before storing in db
// ==============================================
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    throw new InternalServerErrorException(
      "An error occurred while hashing your password."
    );
  }
});

// ==============================================
// 2. Compare Password
// ==============================================
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("There is an error while comparing password.", error);
    throw new BadRequestException(
      "There is an error while comparing password."
    );
  }
};

// ==============================================
// 3. Generate JWT Token
// ==============================================
userSchema.methods.createJWT = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || "t/19HAsveT4xJbTQmf0KHA==",
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    }
  );
};
export const UserModel = model("User", userSchema);
