const mongoose = require("mongoose");

const userBalanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    paymentType:{
        type:String,
        required:true,
        enum:["Bank","Cash"],
        default:"Bank"
    },
    balance: {
        type: Number,
        required: true,
    },
    referenceName : {
        type : String,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    delete:{
        type:Boolean,
        default:false
    }
},{
    timestamps: true
})

const userBalanceModel = mongoose.model("userBalance", userBalanceSchema);

module.exports = { userBalanceModel };