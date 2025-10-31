const mongoose = require('mongoose');

const productDescriptionSchema = mongoose.Schema({
    productNameSize: {
        type: String,
        required: true
    },
    productDescriptionImage: {
        type: [String],
        default: []
    },
    productDescription: {
        type: [{ key: String, value: String }],
        default: []
    },
    specialization: {
        type: [String],
        default: []
    }
});

const productDescriptionModel = mongoose.model('Description', productDescriptionSchema);

module.exports = { productDescriptionModel };
