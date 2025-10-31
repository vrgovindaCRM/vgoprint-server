// models/PrintingEnquiry.js
const mongoose = require('mongoose');

const printingEnquirySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  jobName: {
    type: String,
    required: true,
    trim: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  rate: {
    type: Number,
    required: false,
    min: 0
  },
  remark: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const enquiryModel = mongoose.model('PrintingEnquiry', printingEnquirySchema);

module.exports = { enquiryModel };
