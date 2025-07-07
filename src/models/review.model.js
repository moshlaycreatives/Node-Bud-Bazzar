import { model, Schema } from "mongoose";

// ╔══════════════════════════╗
// ║      Product Schema      ║
// ╚══════════════════════════╝
const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Product rating is required."],
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const ReviewModel = model("Review", reviewSchema);
