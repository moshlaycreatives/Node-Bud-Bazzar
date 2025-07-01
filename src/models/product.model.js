import { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    productName: String,

    description: String,

    sellerPrice: String,

    category: String,

    type: String,
    productType: String,
    strainType: String,
    growType: String,

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: Number,

    labReport: [],

    galleryContent: [],

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Product = model("Product", productSchema);
