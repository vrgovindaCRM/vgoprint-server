const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productNameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductName",
      required: true,
    },
    productImage: {
      type: String,
    },
    paperQuality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paperQuality",
      required: true,
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    side: {
      type: String,
      required: true,
      enum: ["Single", "Double"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    coverPaperQuality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coverPaperQuality",
      required: false,
      default : null
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
