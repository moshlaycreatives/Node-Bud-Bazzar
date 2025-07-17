import { model, Schema } from "mongoose";
import { CANNABINOID_TYPE, PRODUCT_TYPE, STATUS } from "../constants/index.js";

// ╔════════════════════════════════╗
// ║      Order Counter Schema      ║
// ╚════════════════════════════════╝
const orderCounter = new Schema(
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
  { timestamps: true, versionKey: false, collection: "order_counter" }
);

export const OrderCounterModel = model("OrderCounter", orderCounter);

// ╔════════════════════════╗
// ║      Order Schema      ║
// ╚════════════════════════╝
const orderSchema = new Schema(
  {
    id: {
      type: String,
      required: [true, "Order id is required."],
      unique: true,
      immutable: true,
      index: true,
    },

    productStatus: {
      type: String,
      enum: Object.values(STATUS.PRODUCT),
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
      enum: Object.values(PRODUCT_TYPE),
      required: [true, "Product type is required."],
    },

    cannabinoidType: {
      type: String,
      trim: true,
      enum: Object.values(CANNABINOID_TYPE),
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
orderSchema.pre("validate", async function (next) {
  if (this.isNew) {
    try {
      let count = await OrderCounterModel.findOne({ name: "id" });
      if (!count) {
        count = await OrderCounterModel.create({ name: "id" });
      }

      const updatedCounter = await OrderCounterModel.findOneAndUpdate(
        { name: "id" },
        { $inc: { count: 1 } },
        { new: true }
      );

      this.id = updatedCounter.count;
      next();
    } catch (error) {
      console.error("An error occurred while creating order id.");
      return next(error);
    }
  }
});

export const OrderModel = model("Order", orderSchema);
