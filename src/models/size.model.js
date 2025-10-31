const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    size: {
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

const sizeModel = mongoose.model('Size', sizeSchema);

module.exports = { sizeModel };
