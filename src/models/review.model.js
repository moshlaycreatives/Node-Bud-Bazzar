import { Schema, model } from "mongoose";
import { STATUS } from "../constants/index.js";

const reviewSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required."],
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is required."],
    },

    reviewStatus: {
      type: String,
      enum: Object.values(STATUS.RATING),
      default: STATUS.RATING.PENDING,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required."],
    },

    name: {
      type: String,
      trim: true,
      required: [true, "Name is required."],
    },

    email: {
      type: String,
      trim: true,
      required: [true, "Email is required."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    review: {
      type: String,
      trim: true,
      required: [true, "Review is required. "],
    },
  },
  { timestamps: true, versionKey: false }
);

export const ReviewModel = model("Review", reviewSchema);
