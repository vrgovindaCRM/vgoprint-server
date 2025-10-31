const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    productId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Product",
    },
    otherProduct : {
      type : String,
      default : ""
    },
    status: {
      type: String,
      enum: ["Job Placed","Job In Production","Binding & Packing", "Job Dispatch", "Job Deliver", "Job Cancelled","Job Complete"],
      required: true,
    },
    numberOfPages:{
       type : Number,
       default : null
    },
    quantity : {
      type : Number,
      default : 0
    },
    
    size : {
      type : String,
      default : ""
    },
    paperQuality : {
      type : String,
      default : ""
    },
    side:{
      type : String,
      default : ""
    },
    deliveryContactNumber:{
      type:Number,
      default:0,
    },

    remarks : {
      type : String,
      default : ""
    },
    jobName : {
      type : String,
      default : ""
    },
    message: {
      type: String,
      default: '', 
    },
    backCoverImage : {
      type : String,
      default : "",
    },
    frontCoverImage: {
      type : String,
      default : "",
    },
    frontImage : {
      type : String,
      default : "",
    },
    paymentImage : {
      type : String,
      default : "",
    },
    attachFile:{
      type:String,
      default:null
    },
    backImage : {
      type : String,
      default : null,
    },
    price:{
      type : Number,
      required : true
    },
    paymentVerification: {
      type: Boolean,
      required: true,
    },
    totalAmount : {
        type : Number,
        required : true,
    },
    paidByWallet:{
      type:Boolean,
      default:false
    },
    uniqueOrderNumber : {
      type : Number,
      required : true
    },
    byWebsite:{
      type:Boolean,
      required:true
    },
    printNumber : {
      type : String,
      default : "",
    },
    billNumber : {
      type : String,
      default : "",
    },
    fullJobDetails : {
      type : String,
      default : "",
    },
    gst:{
      type:String,
    },
    gstAmount : {
      type : Number,
      required:true
    },
    delete:{
      type:Boolean,
      default:false
  }
  },
  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Order", orderSchema);

module.exports = { orderModel };
