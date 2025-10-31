const mongoose = require('mongoose');

const counterSchema = mongoose.Schema({
    stateCode : {
        type:String,
        required:true,
    },
    count:{
        type:Number
    }
})

const countModel = mongoose.model('printCount',counterSchema);

module.exports = countModel;