const mongoose = require('mongoose');

const ownDetailsSchema = mongoose.Schema({
    heading : {
        type:String,
        required:true,
        
    },
    subHeading : {
        type:String,        
    },
    ownDetailImage : {
        type:String,
        required:true,
        
    },
    text:{
        type : String,
        required:true,
    },
    rank : {
        type : Number,
        required : true
    },
    delete:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})

const ownDetailsModel = mongoose.model('ownDetails',ownDetailsSchema);

module.exports = ownDetailsModel;