const mongoose = require("mongoose");

const productNameSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
        },
        image: {
            type: String,
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

const productNameModel = mongoose.model("ProductName", productNameSchema);

module.exports = { productNameModel };