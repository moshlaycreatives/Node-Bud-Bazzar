import { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    productName: String,

    description: String,

    price: String,

    category: String,

    companyName: String,

    clientName: String,

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: Number,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Product = model("Product", productSchema);
