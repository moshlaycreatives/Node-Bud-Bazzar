import { Schema, model } from "mongoose";
import { PRODUCT_TYPES } from "../constants/index.js";

const categorySchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required."],
      index: true,
    },

    name: {
      type: String,
      trim: true,
      required: [true, "Category name is required."],
      unique: [true, "Category name already taken."],
      index: true,
    },

    image: {
      type: String,
      trim: true,
      required: [true, "Category image is required."],
    },

    productType: {
      type: String,
      enum: PRODUCT_TYPES,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const CategoryModel = model("Category", categorySchema);
