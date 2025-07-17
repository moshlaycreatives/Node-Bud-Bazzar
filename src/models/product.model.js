import { model, Schema } from "mongoose";
import {
  CANNABINOID_TYPE,
  PRODUCT_TAGS,
  PRODUCT_TYPE,
  STATUS,
} from "../constants/index.js";

// ╔══════════════════════════════════╗
// ║      Product Counter Schema      ║
// ╚══════════════════════════════════╝
const productCounter = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    count: {
      type: Number,
      default: 2000,
    },
  },
  { timestamps: true, versionKey: false, collection: "product_counter" }
);

export const ProductCounterModel = model("ProductCounter", productCounter);

// ╔══════════════════════════╗
// ║      Product Schema      ║
// ╚══════════════════════════╝
const productSchema = new Schema(
  {
    id: {
      type: String,
      required: [true, "Product id is required."],
      unique: true,
      immutable: true,
      index: true,
    },

    productStatus: {
      type: String,
      enum: Object.values(STATUS.PRODUCT).slice(0, 2), // PENDING, APPROVED
      default: STATUS.PRODUCT.PENDING,
    },

    productName: {
      type: String,
      trim: true,
      required: [true, "Product name is required."],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      required: [true, "Product description is required."],
    },

    sellerPrice: {
      type: Number,
      required: [true, "Seller price is required."],
    },

    productCategory: {
      type: String,
      trim: true,
      required: [true, "Product category is required."],
    },

    productType: {
      type: String,
      trim: true,
      enum: Object.values(PRODUCT_TYPE), // CANNABIS, HEMP
      required: [true, "Product type is required."],
    },

    cannabinoidType: {
      type: String,
      trim: true,
      enum: Object.values(CANNABINOID_TYPE), // THCA, THCP
      required: [true, "Cannabinoid type is required."],
    },

    strainType: {
      type: String,
      trim: true,
      required: [true, "Product strain type is required."],
    },

    growType: {
      type: String,
      trim: true,
      required: [true, "Product grow type is required."],
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    labReport: {
      type: String,
      trim: true,
      required: [true, "Product lab report is required."],
    },

    productImage: {
      type: String,
      trim: true,
      required: [true, "Product image is required."],
    },

    galleryContent: [
      {
        type: String,
        trim: true,
      },
    ],

    profitMargin: {
      type: Number,
      default: 0,
    },

    productTags: {
      type: [String],
      enum: Object.values(PRODUCT_TAGS), // NEW, RECOMMENDED, FEATURED
      default: [PRODUCT_TAGS.NEW],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

// ╔═══════════════════════════════════════════════════╗
// ║      Pre-Validate Hook (Add id value in data)     ║
// ╚═══════════════════════════════════════════════════╝
productSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      let count = await ProductCounterModel.findOne({ name: "id" });
      if (!count) {
        count = await ProductCounterModel.create({ name: "id" });
      }

      const updatedCounter = await ProductCounterModel.findOneAndUpdate(
        { name: "id" },
        { $inc: { count: 1 } },
        { new: true }
      );

      this.id = updatedCounter.count;
      next();
    } catch (error) {
      console.error("An error occurred while creating product id.");
      return next(error);
    }
  }
});

export const ProductModel = model("Product", productSchema);
