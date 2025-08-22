import { model, Schema } from "mongoose";
import { PAYMENT_METHODS } from "../constants/index.js";

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

const orderedProductSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is required."],
    },

    qty: {
      type: Number,
      required: [true, "Product quantity is required."],
      min: [1, "Product quantity must be at least 1."],
    },

    sellerPrice: {
      type: Number,
      required: [true, "Seller price is required."],
    },

    profitMargin: {
      type: Number,
      required: [true, "Profit margin is required."],
      min: [0, "Profit margin cannot be negative."],
    },
  },
  { _id: false, versionKey: false, timestamps: false }
);

const subOrderSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Seller id is required."],
  },

  categories: {
    type: [String],
    trim: true,
    required: [true, "Product category is required."],
  },

  products: [orderedProductSchema],

  subTotal: {
    type: Number,
    required: [true, "Subtotal is required."],
  },

  shippingCost: {
    type: Number,
    required: [true, "Shipping cost is required."],
  },

  total: {
    type: Number,
    required: [true, "Total amount is required."],
  },
});

// ╔════════════════════════╗
// ║      Order Schema      ║
// ╚════════════════════════╝
const orderSchema = new Schema(
  {
    orderCustomId: {
      type: Number,
      required: [true, "Order id is required."],
      unique: true,
      immutable: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer id is required."],
    },

    order: {
      type: [subOrderSchema],
      required: [true, "Order details are required."],
    },

    whitneyBlockId: {
      type: Schema.Types.ObjectId,
      ref: "WhitneyBlock",
      required: [true, "Whitney block id is required."],
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: [true, "Payment method is required."],
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
      let count = await OrderCounterModel.findOne({ name: "orderCustomId" });
      if (!count) {
        count = await OrderCounterModel.create({ name: "orderCustomId" });
      }

      const updatedCounter = await OrderCounterModel.findOneAndUpdate(
        { name: "orderCustomId" },
        { $inc: { count: 1 } },
        { new: true }
      );

      this.orderCustomId = updatedCounter.count;
      next();
    } catch (error) {
      console.error("An error occurred while creating order custom id.");
      return next(error);
    }
  }
});

export const OrderModel = model("Order", orderSchema);
