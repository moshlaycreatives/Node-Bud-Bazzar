import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  BadRequestException,
  InternalServerErrorException,
} from "../errors/index.js";
import { ACCOUNT_TYPE, PRODUCT_TYPE, STATUS } from "../constants/index.js";

// ╔═══════════════════════════════╗
// ║      User Counter Schema      ║
// ╚═══════════════════════════════╝
const userCounter = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    count: {
      type: Number,
      default: 19999,
    },
  },
  { timestamps: true, versionKey: false }
);

export const UserCounterModel = model("UserCounter", userCounter);

// ╔═══════════════════════╗
// ║      User Schema      ║
// ╚═══════════════════════╝
const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    accountType: {
      type: String,
      enum: Object.values(ACCOUNT_TYPE),
      required: true,
      immutable: true,
      index: true,
    },

    accountStatus: {
      type: String,
      enum: Object.values(STATUS.ACCOUNT),
      default: STATUS.ACCOUNT.PENDING,
      index: true,
    },

    firstName: {
      type: String,
      trim: true,
      required: [true, "Frist name is required."],
      index: true,
    },

    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required."],
      index: true,
    },

    companyName: {
      type: String,
      trim: true,
      required: [true, "Company name is required."],
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
      trim: true,
      required: [true, "Phone number is required."],
    },

    address: {
      type: String,
      trim: true,
      required: [true, "Address is required."],
    },

    productType: {
      type: String,
      enum: Object.values(PRODUCT_TYPE),
      required: [true, "Product type is required."],
      immutable: true,
      index: true,
    },

    olccNumber: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
    },

    resetPassword: {
      type: Boolean,
      default: false,
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

// ╔════════════════════════════════════╗
// ║      Pre-Hook (Hash Password)      ║
// ╚════════════════════════════════════╝
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(
      new InternalServerErrorException(
        "An error occurred while hashing your password."
      )
    );
  }
});

// ╔══════════════════════════╗
// ║      Pre-Validation      ║
// ╚══════════════════════════╝
userSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      let count = await UserCounterModel.findOne({ name: "id" });
      if (!count) {
        count = await UserCounterModel.create({ name: "id" });
      }

      const updatedCount = await UserCounterModel.findOneAndUpdate(
        { name: "id" },
        { $inc: { count: 1 } },
        { new: true }
      );

      const prefix =
        this.firstName.slice(0, 1).toUpperCase() +
        this.lastName.slice(0, 1).toUpperCase();
      this.id = `${prefix}${updatedCount.count.toString()}`;
      next();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ╔════════════════════════════╗
// ║      Compare Password      ║
// ╚════════════════════════════╝
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword.toString(), this.password);
  } catch (error) {
    console.error("There is an error while comparing password.", error);
    throw new BadRequestException(
      "There is an error while comparing password."
    );
  }
};

// ╔══════════════════════════════╗
// ║      Generate JWT Token      ║
// ╚══════════════════════════════╝
userSchema.methods.createJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};
export const UserModel = model("User", userSchema);
