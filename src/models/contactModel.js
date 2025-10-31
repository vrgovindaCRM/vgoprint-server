const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, 
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true, 
    },
    mobileNumbers: {
      type: [String],
      required: true, 
    },
    rank: {
      type: Number,
      required: true, 
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const contactModel = mongoose.model('contact', contactSchema);
module.exports = contactModel;
