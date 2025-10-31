const userModel = require("../models/user.model");
const generateUserNumber = require("../utils/generateNumber");
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { sendVerifyMail, sendUserNumber, sendResetMail } = require("../services/email");

const generateVerificationToken = () =>{
  return jwt.sign({data:"verification token"},process.env.SECRETKEY,{expiresIn:'1h'});
}

const generateResetToken = () =>{
  return jwt.sign({data:"reset token"},process.env.SECRETKEY,{expiresIn:'1h'});
}

// ***************************SignUp******************************************************

exports.userSignUp = async (req, res) => {
    try {
      const { email, password,acceptTerms, name,deliveryAddressId, deliveryAddress,alternateNumber,address,mobileNumber, businessName, state , city, pinCode,gstNumber,stateCode} =
      req.body;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!emailPattern.test(email)) {
        console.error("Invalid email format");
        return res.status(400).json({ message: "Invalid email format" });
      }

      if(!email){
        return res.status(400).json({message : "Email is Required"})
      } 
      if(!password){
        return res.status(400).json({message : "password is Required"})
      }
      if(!name){
        return res.status(400).json({message : "name is Required"})
      }
      if(!deliveryAddress){
        return res.status(400).json({message : "delivery Address is Required"})
      }
      if(!address){
        return res.status(400).json({message : "user Address is Required"})
      }
      if(!gstNumber){
        return res.status(400).json({message : "gstNumber is Required"})
      }
      if(!mobileNumber){
        return res.status(400).json({message : "mobile Number is Required"})
      }
      if(!businessName){
        return res.status(400).json({message : "businessName is Required"})
      }
      if(!state){
        return res.status(400).json({message : "state is Required"})
      }
      if(!pinCode){
        return res.status(400).json({message : "pin Code is Required"})
      }
      if(!stateCode){
        return res.status(400).json({message : "state Code is Required"})
      }
      if(!city){
        return res.status(400).json({message : "city is Required"})
      }
  
      let existingUser = await userModel.findOne({ email });

      if (existingUser) {
         if(existingUser.isVerified && existingUser.delete === false){
          console.error("User already exists");
          return res.status(400).json({
            message:
              "User already exists with the email. Please use a different emails",
          });
         }else if(existingUser.isVerified && existingUser.delete){
           existingUser.delete = false;
           existingUser.name = name;
           existingUser.deliveryAddress = deliveryAddress;
           existingUser.userAddress = address;
           existingUser.gstNumber =gstNumber;
           existingUser.mobileNumber = mobileNumber;
           existingUser.businessName = businessName;
           existingUser.state = state;
           existingUser.pinCode = pinCode;
           existingUser.stateCode = stateCode;
           existingUser.password = await argon2.hash(password)
           await existingUser.save();
           return res.status(200).json({message:"User Created"})
         }else if(!existingUser.isVerified){
          await userModel.findOneAndDelete({ email });
         }
      }
      
      const newUser = new userModel({
        email,
        name,
        mobileNumber, 
        businessName, 
        deliveryAddress,
        deliveryAddressId,
        alternateNumber,
        userAddress : address,
        stateCode,
        city,
        role:"customer",
        state,
        pinCode,
        acceptTerms,
        delete : false,
        gstNumber,
      });

      newUser.password = await argon2.hash(password);

      const verifyToken = generateVerificationToken();
      newUser.verificationkey = verifyToken;
      await sendVerifyMail(email,verifyToken);
  
      await newUser.save();
    
      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Internal Server error" });
    }
  };

// ***************************Mail Verification******************************************************

exports.verifyMail = async (req, res) => {
  const { verificationToken } = req.params;
  try {
    const user = await userModel.findOne({ verificationkey: verificationToken });
    if (!user) {
      return res.status(404).json({ message: "User not found or already verified" });
    }
    if(user.isVerified){
      return res.status(400).json({ message: "already verified" });

    }

    user.isVerified = true;
    let userNum;
    if (user.userNumber === 'value') {
      userNum = await generateUserNumber(user.stateCode);
     
      user.userNumber = userNum;
      await sendUserNumber(user.email, userNum);
    }
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};


// ***************************login******************************************************

  exports.userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      let user;
  
      if (email && password) {
        user = await userModel.findOne({ email });
        if(!user) {

          user = await userModel.findOne({ userNumber: email });
        }
      
      }else {
        console.error("Email/password must be provided for login");
        return res.status(400).json({
          message: "Email/password or localId must be provided for login",
        });
      }

      if (!user) {
        console.error("User not found");
        return res
          .status(401)
          .json({ message: "User not found. Please sign up first" });
      }

      if(user.deleteUser){
        return res.status(401).json({ message: "Your account has been deleted" });
      }

      if (!user.isVerified) {
        console.error("User not verified");
        return res
          .status(401)
          .json({ message: "User not verified. Please verify your email" });
      }
let token
      if (await argon2.verify(user.password, password)) {
           token = jwt.sign({userId:user._id},process.env.SECRETKEY,{expiresIn:'72h'})
      } else {
        console.error("Invalid credentials");
    return res.status(401).json({
      message: "Invalid credentials. Please check your email and password",
    });
      }
      console.log("User logged in successfully");
      res.status(200).json({ user, token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Internal Server error" });
    }
  };


  // ****************** forget Password ******************************

  exports.forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        console.log('Email is required');
        return res.status(400).json({ message: "Email is required" });
      }
  
      const user = await userModel.findOne({ email });
  
      if (!user) {
        console.log("Email is incorrect");
        return res.status(400).json({ message: "Email is incorrect" });
      }

      if(user.deleteUser){
        return res.status(401).json({ message: "Your account has been deleted" });
      }
  
      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000);
  
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpires;
  
      await user.save();
  
      sendResetMail(user.email, resetToken);
      console.log("Reset password email sent successfully");
      res.status(200).json({ message: "Reset password email sent successfully", msg: "OK" });
  
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  


  // *********************** Reset Password **************************

  exports.resetPassword = async (req,res) =>{
    const {resetToken,newPassword,confirmPassword} = req.body;
  try {
    if(!resetToken || !newPassword){
      return res.status(400).json({message:"Reset Token and New Password is Required"});
    }

    if(newPassword !== confirmPassword){
      return res.status(400).json({message : "Passwords do not match"});
    }

    const user = await userModel.findOne({resetToken});

    if(!user){
      return res.status(400).json({message:"Invalid or expired reset token"})
    }

    if(user.deleteUser){
      return res.status(401).json({ message: "Your account has been deleted" });
    }

    if(user.resetTokenExpiry < Date.now()){
      return res.status(400).json({message:"Reset Token has expired"})
    }

    const hashPassword = await argon2.hash(newPassword);
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    user.save();
    res.redirect(`https://print-hub-client.vercel.app/login`)
  } catch (error) {
    
  console.error("Error resetting password:", error);
  res.status(500).json({ message: "Internal server error" });
  }

  }

  // ********************* Get Users ***********************************

  exports.getUsers = async (req, res) => {
    try {
     
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3;
  
      const skip = (page - 1) * limit;
  
      const usersQuery = userModel.find({delete: false}).skip(skip).limit(limit);
  
      const users = await usersQuery.exec();
  
      const totalCount = await userModel.countDocuments({delete: false});
  
      res.json({ users, totalCount });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  // *********************  user Details *****************************

  exports.userDetails = async (req, res) => {
    const { userId } = req.user;
    try {
      const user = await userModel.findById(userId);

      if(!user){
        return res.status(400).json({message : "User not found"})
      }

      if(user.deleteUser){
        return res.status(400).json({message : "Your account has been deleted"})
      }

      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  exports.getUserById = async (req,res) =>{
    const {id} = req.params;

    try {
      const user = await userModel.findById({_id : id , delete : false});
      if(!user){
        return res.status(400).json({message : "User not found"});
      }
      res.status(200).json({message : "User found" , user});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }

  exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, ...otherUpdates } = req.body;
    
    try {
      const user = await userModel.findOne({ _id: id, delete : false });
      
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (Object.keys(otherUpdates).length > 0) {
        Object.assign(user, otherUpdates);
      }
      
      if (password) {
        user.password = await argon2.hash(password);
      }
      await user.save();
      
      res.status(200).json({
        message: "Updated successfully",
        user: user
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  };