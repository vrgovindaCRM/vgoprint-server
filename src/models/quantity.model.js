const mongoose = require('mongoose');

const quantitySchema = new mongoose.Schema(
  {
    quantity: {
      type: String,
      required: true,
    },
    delete:{
      type:Boolean,
      default:false
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
  },
  { timestamps: true }
);

const quantityModel = mongoose.model('quantity', quantitySchema);

module.exports = { quantityModel };
