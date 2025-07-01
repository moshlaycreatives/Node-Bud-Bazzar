import { Schema, model } from "mongoose";
import { STATUS } from "../constants/index.js";

// ╔═══════════════════════════════════╗
// ║      Category Request Schema      ║
// ╚═══════════════════════════════════╝
const categoryRequestSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    categoryName: {
      type: String,
      trim: true,
      required: [true, "Category name is required."],
      unique: true,
      index: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: Object.values(STATUS.CETEGORY_STATUS),
      default: STATUS.CETEGORY_STATUS.PENDING,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true, versionKey: false, collection: "category_requests" }
);

// ╔═══════════════════════════════════════════╗
// ║      Export - Category Request Model      ║
// ╚═══════════════════════════════════════════╝
export const CategoryRequestModel = model(
  "CategoryRequest",
  categoryRequestSchema
);
