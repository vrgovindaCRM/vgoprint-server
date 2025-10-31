const mongoose = require('mongoose');

const paperQualitySchema = new mongoose.Schema(
  {
    paperQuality: {
      type: String,
      required: true,
    },
    productNameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductName',
      required: true,
    },
    rank:{
      type:Number,
      default:0
  },
    delete:{
      type:Boolean,
      default:false
  }
  },
  { timestamps: true }
);

const paperQualityModel = mongoose.model('paperQuality', paperQualitySchema);

module.exports = { paperQualityModel };
