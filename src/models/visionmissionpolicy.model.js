const mongoose = require('mongoose');

const visionSchema = mongoose.Schema({
    text : {
        type:String,
        required:true,
    },
    heading : {
        type:String,
        required:true,
    },
    rank : {
        type:Number,
        required:true,
    },
    delete:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const visionModel = mongoose.model('vision',visionSchema);

module.exports = visionModel;