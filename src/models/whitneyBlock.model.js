import { model, Schema } from "mongoose";

// ╔═══════════════════════════════╗
// ║      WhitneyBlock Schema      ║
// ╚═══════════════════════════════╝
const whitneyBlockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      trim: true,
      index: true,
    },

    lastName: {
      type: String,
      trim: true,
      index: true,
    },

    address: {
      type: String,
      trim: true,
    },

    strAptBid: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      trim: true,
      index: true,
    },

    zipCode: {
      type: String,
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, "Please enter a valid zip code."],
    },

    phoneNo: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number."],
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true, versionKey: false }
);

// ╔═══════════════════════════════════════════════════╗
// ║      Index for Full Name Search                  ║
// ╚═══════════════════════════════════════════════════╝
whitneyBlockSchema.index({ firstName: 1, lastName: 1 });

// ╔═══════════════════════════════════════════════════╗
// ║      Index for Location Search                   ║
// ╚═══════════════════════════════════════════════════╝
whitneyBlockSchema.index({ city: 1, state: 1 });

export const WhitneyBlockModel = model("WhitneyBlock", whitneyBlockSchema);
