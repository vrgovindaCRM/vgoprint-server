const mongoose = require('mongoose');

const InfoSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    rank:{
        type:Number,
        required:true
    },
    delete:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
});

const InfoModel = mongoose.model('Info', InfoSchema);

module.exports = InfoModel;
