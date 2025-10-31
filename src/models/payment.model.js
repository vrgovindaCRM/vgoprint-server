

const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    QRimage : {
        type : String,
    },
    bankName : {
        type : String,
    },
    rank : {
        type : Number,
        required : true
    },
    branchName : {
        type : String
    },
    firmName : {
        type : String,
    },
    accountNumber  : {
        type : String
    },
    ifscCode : {
        type : String
    },
    delete:{
        type:Boolean,
        default:false
    }
    
})

const paymentModel = mongoose.model('paymentDetails', paymentSchema);

module.exports = {paymentModel}