const mongoose = require('mongoose');

const coverPaperQualitySchema = new mongoose.Schema(
  {
    coverPaperQuality: {
      type: String,
      required: true,
    },
    productNameId:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'ProductName',
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

const coverPaperQualityModel = mongoose.model('coverPaperQuality', coverPaperQualitySchema);

module.exports = { coverPaperQualityModel };
