const mongoose = require('mongoose');

const footerAddressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    stateCode:{
        type:String,
        require: true,
    },
    landMark:{
        type: String,
        required: true
    },
    pinCode:{
        type: Number,
        required: true
    },
    role:{
        type: String,
    },
    number:{
        type:Number,
        default:0
    },
    delete:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
});

const footerAddressModel = mongoose.model('footerAdress', footerAddressSchema);

module.exports = footerAddressModel;
