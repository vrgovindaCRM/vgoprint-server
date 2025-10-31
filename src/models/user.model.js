const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
      },
      creditLimit:{
        type : Number,
        default : 0,
      },
      acceptTerms:{
        type:Boolean,
      },
      mobileNumber:{
        type:Number,
        required:true
      },
      alternateNumber : {
        type:Number,
        required : false
      },
      role: {
         type: String,
         enum: ['customer', 'admin'],
         default: 'customer' },
      name: {
        type: String,
        required: true,
    
      },
      businessName:{
        type:String,
        required:true
      },
      userAddress:{
        type:String,
        required:true
      },
      deliveryAddress:{
         type:String,
         required:true
      },
      deliveryAddressId : {
        type:mongoose.Types.ObjectId,
        ref:"footerAdress",
        required : true
      },
      state:{
        type:String,
        require:true
      },
      city:{
        type: String,
        require : true
      },
      stateCode:{
        type: String,
        require : true,
      },
      maxCreditLimit:{
        type:Number,
        default:0
      },
      isVerified:{
        type:Boolean,
        default : false
      },
      verificationkey:{
         type:String
      },
      pinCode:{
        type:String,
        required:true
      },
      gstNumber:{
        type:String,
      },
      userNumber:{
        type:String,
        default:"value"
      },
      resetToken : {
        type:String,
      },
      resetTokenExpiry :{
        type: Date,
      },
      balance : {
        type : Number,
        default : null
      },
      delete:{
        type:Boolean,
        default : false
      },
},{
    timestamps: true
})

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;