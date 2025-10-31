const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    name:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },
    permissions:{
        type: [String],
        default: [],
    },
    delete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

const adminModel = mongoose.model("admin", adminSchema);

module.exports = { adminModel };