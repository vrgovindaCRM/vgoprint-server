
const mongoose = require("mongoose");

const termsSchema = mongoose.Schema({
    terms : {
        type:String,
        required:true,
    },
    rank:{
        type:Number,
        default:0
    },
    delete:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
})

const termsModel = mongoose.model("terms", termsSchema);

module.exports = termsModel;