const mongoose = require('mongoose');

const aboutSchema = mongoose.Schema({
    text : {
        type:String,
        required:true,
    },
    rank:{
        type:Number,
        required:true
    },
    delete:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})

const aboutModel = mongoose.model('about',aboutSchema);

module.exports = aboutModel;