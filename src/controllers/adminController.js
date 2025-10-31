const userModel = require("../models/user.model");
const generateUserNumber = require("../utils/generateNumber");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const {
  sendVerifyMail,
  sendUserNumber,
  sendResetMail,
} = require("../services/email");
const footerAddressModel = require("../models/footerAddress.model");
const InfoModel = require("../models/homePage.model");
const { paperQualityModel } = require("../models/paperQuality.model");
const { quantityModel } = require("../models/quantity.model");
const  productModel  = require('../models/product.model');
const { coverPaperQualityModel } = require("../models/coverPaperQuality.model");
const { orderModel } = require("../models/order.model");
const { adminModel } = require("../models/admin.model");
const { productNameModel } = require("../models/productName.model");
const { sizeModel } = require("../models/size.model");
const termsModel = require("../models/terms.model");
const visionModel = require("../models/visionmissionpolicy.model");
const { paymentModel } = require("../models/payment.model");
const ownDetailsModel = require("../models/ownDetails.model");
const aboutModel = require("../models/about.model");
const { userBalanceModel } = require("../models/userBalance.model");
const { default: mongoose } = require("mongoose");
const cloudinary = require("cloudinary").v2;

const generateVerificationToken = () => {
  return jwt.sign({ data: "verification token" }, process.env.SECRETKEY, {
    expiresIn: "1h",
  });
};

const generateResetToken = () => {
  return jwt.sign({ data: "reset token" }, process.env.SECRETKEY, {
    expiresIn: "1h",
  });
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password , name , permission  } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      console.error("Invalid email format");
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!email || !password) {
      console.error("Email and password are required");
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await adminModel.findOne({ email });
    
    if(!existingUser) {
      const user = await userModel.findOne({email});
      if(user) {
        console.error("User already exists");
        return res
          .status(400)
          .json({ message: "User already exists with the email" });
      }
    }

    if (existingUser) {
      console.error("User already exists");
      return res
        .status(400)
        .json({ message: "User already exists with the email" });
    }
    const newUser = new adminModel({ email, password, role: "admin" , name , permissions : permission });
    newUser.password = await argon2.hash(password);
    await newUser.save();
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.updateAdmin = async(req,res) =>{
  try {
    const { email, name, permission  } = req.body;

    const user = await adminModel.findOne({ email });
    if(!user){
      return res.json({message : "User not found"})
    }
    user.email = email || user.email;
    user.name = name || user.name;
    user.permissions = permission || user.permissions;
    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error });
  }
}

exports.deleteAdmin = async(req,res) =>{
  const { adminId } = req.params;
  try {
    const user = await adminModel.findById(adminId);
    if(!user){
      return res.status(404).json({ message : "User not found"})
    }
    user.delete = true;
    await user.save();
    res.status(200).json({ message : "User deleted successfully"})
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

exports.createUser = async(req,res) =>{
  try {
    const { email, password, name, address,mobileNumber, businessName, state , city, pinCode,gstNumber,role,stateCode} =
      req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      console.error("Invalid email format");
      return res.status(400).json({ message: "Invalid email format" });
    }

    if(!email){
      return res.json({message : "Email is Required"})
    } 
    if(!password){
      return res.json({message : "password is Required"})
    }
    if(!name){
      return res.json({message : "name is Required"})
    }
    if(!address){
      return res.json({message : "address is Required"})
    }
    if(!mobileNumber){
      return res.json({message : "mobile Number is Required"})
    }
    if(!businessName){
      return res.json({message : "businessName is Required"})
    }
    if(!state){
      return res.json({message : "state is Required"})
    }
    if(!pinCode){
      return res.json({message : "pin Code is Required"})
    }
    if(!stateCode){
      return res.json({message : "failed to get state Code"})
    }
    if(!city){
      return res.json({message : "city is Required"})
    }

    let existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        console.error("User already exists");
        return res.status(400).json({
          message:
            "User already exists with the email. Please use a different email",
        });
      } else {
        await userModel.findOneAndDelete({ email });
      }
    }
    
    const newUser = new userModel({
      email,
      name,
      mobileNumber, 
      businessName, 
      address, 
      pinCode,
      stateCode,
      city,
      state,
      acceptTerms:true,
      role,
      gstNumber,
    });

    newUser.password = await argon2.hash(password);

    if(role === 'customer'){
      const verifyToken = generateVerificationToken();
      newUser.verificationkey = verifyToken;
      await sendVerifyMail(email, verifyToken);
     } else if(role === 'admin'){
      newUser.isVerified = true;
      newUser.userNumber = "Admin";
     }
    await newUser.save();
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

exports.verifyMail = async (req, res) => {
  const { verificationToken } = req.params;
  try {
    const user = await userModel.findOne({
      verificationkey: verificationToken,
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already verified" });
    }

    user.isVerified = true;
    let userNum;
    if (user.userNumber === "value" && user.role === "customer") {
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

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    if (email && password) {
      user = await adminModel.findOne({ email });
    } else {
      console.error("Email/password must be provided for login");
      return res.status(400).json({
        message: "Email/password must be provided for login",
      });
    }

    if (!user) {
      console.error("User not found");
      return res
        .status(401)
        .json({ message: "User not found. Please sign up first" });
    }

    if(user.delete){
      return res.status(401).json({ message: "Your account has been deleted" });
    }
    let token;
    if (await argon2.verify(user.password, password)) {
      token = jwt.sign({ userId: user._id }, process.env.SECRETKEY, {
        expiresIn: "1572h",
      });
    } else {
      console.error("Invalid credentials");
      return res.status(401).json({
        message: "Invalid credentials. Please check your email and password",
      });
    }
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await adminModel.findOne({ email });

    if (!user) {
      console.log("Email is incorrect");
      return res.status(400).json({ message: "Email is incorrect" });
    }

    if(user.delete){
      return res.status(401).json({ message: "Your account has been deleted" });
    }

    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 3600000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpires;

    await user.save();

    sendResetMail(user.email, resetToken);
    console.log("Reset password email sent successfully");
    res
      .status(200)
      .json({ message: "Reset password email sent successfully", msg: "OK" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const admin = await adminModel.find({delete: false});
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ admin });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;
  try {
    if (!resetToken || !newPassword) {
      return res
        .status(400)
        .json({ message: "Reset Token and New Password is Required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await userModel.findOne({ resetToken });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if(user.delete){
      return res.status(401).json({ message: "Your account has been deleted" });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Reset Token has expired" });
    }

    const hashPassword = await argon2.hash(newPassword);
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    user.save();
    res.redirect(`htts://print-hub-client.vercel.app/login`);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.find({delete: false});

    const totalCount = await userModel.countDocuments();

    res.json({ users, totalCount });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.delete){
      return res.status(400).json({ message: "User already deleted" });
    }

    user.delete = true;
    await user.save();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};


exports.postHomePageDetails = async(req,res) => {
  const {heading,content} = req.body;
  
 try {

     const detail = new InfoModel({heading,content});
     await detail.save();
     res.status(201).json({message : "added successfully!",detail})
  } catch (error) {
     res.status(500).json({error})
  }
}

exports.deleteHomePageDetails = async (req,res) => {
 const {detailId} = req.params;

 try {
     const detail = await InfoModel.findById(detailId);

     if(!detail) {
      return res.status(404).json({message : "Details Not found"})
     }

     if(detail.delete){
      return res.status(400).json({ message: "Details already deleted" });
     }

     detail.delete = true;
     await detail.save();


     res.status(201).json({message : "Deleted successfully"})

 } catch (error) {
     res.status(500).json({message:error})
 }
}

exports.updateHomePageDetails = async (req,res) => {
 const {detailId} = req.params;

 try {
     let detail = await InfoModel.findById(detailId);

     if(!detail) {
      return res.status(404).json({message : "Details Not found"})
     }
     if(detail.delete){
      return res.status(400).json({ message: "Details already deleted" });
     }

     await InfoModel.findByIdAndUpdate({_id:detailId},req.body);

     detail = await InfoModel.findById(detailId);

     res.status(201).json({message : "updated successfully",detail})

 } catch (error) {
     res.status(500).json({message:error})
 }
}

exports.getHomePageDetails = async (req, res) => {
  try {
      
      const detail = await InfoModel.find({delete: false}).sort({rank: 1});
      const totalCount = await InfoModel.countDocuments({delete: false});
      
      res.json({ detail, totalCount});
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


exports.postFooterAddress = async(req,res) => {
    const {address,state,city,stateCode,landMark,pinCode,role} = req.body;


  try {
          if(!address){
               return res.state(404).josn({message:'address is Required'})
          }
          if(!state){
            return res.state(404).josn({message:'State is Required'})
       }
       if(!city){
        return res.state(404).josn({message:'City is Required'})
      }
    
       if(!stateCode){
       return res.state(404).josn({message:'Unique State Code is Required'})
      }
      if(!landMark){
        return res.state(404).josn({message:'Landmark is Required'})
       } 
       if(!pinCode){
        return res.state(404).josn({message:'Pin Code is Required'})
       }

      const addresss = new footerAddressModel({address,state,city,stateCode,landMark,pinCode,role});
      await addresss.save();
      res.status(201).json({message : "added successfully!",addresss})
      } catch (error) {
      res.status(500).json({error})
      }
}

exports.deleteFooterAddress = async (req,res) => {
  const {addressId} = req.params;

  try {
      const address = await footerAddressModel.findById(addressId);

      if(!address) {
       return res.status(404).json({message : "Details Not found"})
      }
      if(address.delete){
        return res.status(400).json({ message: "Details already deleted" });
       }

      address.delete = true;
      await address.save();

      res.status(201).json({message : "Deleted successfully"})

  } catch (error) {
      res.status(500).json({message:error})
  }
}

exports.updateFooterAddress = async (req,res) => {
  const {addressId} = req.params;

  try {
      let address = await footerAddressModel.findById(addressId);

      if(!address) {
       return res.status(404).json({message : "Address Not found"})
      }

      if(address.delete){
        return res.status(400).json({ message: "Address already deleted" });
       }

      await footerAddressModel.findByIdAndUpdate({_id:addressId},req.body);
      
      address = await footerAddressModel.findById(addressId);

      res.status(201).json({message : "updated successfully",address})

  } catch (error) {
      res.status(500).json({message:error})
  }
}

exports.getFooterAddress = async (req, res) => {
  try {
   

    const address = await footerAddressModel.find({delete: false})
    const totalCount = await footerAddressModel.countDocuments({delete: false});

    res.json({ address, totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStates = async (req, res) => {
  try {
    const states = await footerAddressModel.aggregate([
      {
        $group: {
          _id: {
            state: "$state",
            city: "$city",
            stateCode: "$stateCode"
          }
        }
      },
      {
        $group: {
          _id: "$_id.state",
          city: { $first: "$_id.city" },
          stateCode: { $first: "$_id.stateCode" }
        }
      },
      {
        $project: {
          _id: 0,
          state: "$_id",
          city: 1,
          stateCode: 1
        }
      },
    ]);
    res.status(200).json({ states });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProductName = async (req, res) => {
  try {
    const { product } = req.body;
    const existingProduct = await productNameModel.findOne({ productName: product });

   
    let pictureUrl;
    if (req.file) {
      try {
        const fileStr = req.file.buffer.toString("base64");
        const fileType = req.file.mimetype;
        const fileUri = `data:${fileType};base64,${fileStr}`;
        
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "products",
          resource_type: "auto",
        });
        
        pictureUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          status: false,
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    }
  const rank = await productNameModel.countDocuments({}) + 1;
  if (existingProduct) {
    if(existingProduct.delete){
      existingProduct.delete = false;
      existingProduct.image = pictureUrl;
      existingProduct.rank = rank
      await existingProduct.save();
      return res.status(201).json({ message: "Product created successfully"});
    }
    return res.status(400).json({ message: "already exist"});
  }

    const newProduct = new productNameModel({ productName: product , image : pictureUrl , rank });
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.createSize = async (req, res) => {
  try {
    const { product , productNameId } = req.body;
    const existingSize = await sizeModel.findOne({ size : product , productNameId });
    const rank = await sizeModel.countDocuments({}) + 1;

    if(existingSize){
      if(existingSize.delete){
        existingSize.delete = false;
        existingSize.rank=rank
        await existingSize.save();
        return res.status(201).json({message : "Created successfully"});
      }
      return res.status(400).json({ message: "Size already exists" });
    }
    const newSize = new sizeModel({ size : product , productNameId , rank });

    await newSize.save();
    res.status(201).json({ message: 'Size created successfully', size: newSize });
  } catch (error) {
    console.error('Error creating size:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const { sizeId } = req.params;

    const size = await sizeModel.findById(sizeId);

    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    if(size.delete){
      return res.status(403).json({message : "Size already deleted"});
    }

    size.delete = true;
    await size.save();
    res.status(200).json({ message: 'Size deleted successfully' });
  } catch (error) {
    console.error('Error deleting size:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    const { size } = req.body;

    const sizes = await sizeModel.findById(sizeId);

    if (!sizes) {
      return res.status(404).json({ message: 'Size not found' });
    }

    if(sizes.delete){
      return res.status(403).json({message : "Size already deleted"});
    }

    sizes.size = size;
    const updatedSize = await sizes.save();

    res.status(200).json({ message: 'Size updated successfully', size: updatedSize });
  } catch (error) {
    console.error('Error updating size:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

exports.getAllProductName = async (req, res) => {
  try {
    const products = await productNameModel.find({delete: false});

    res.status(200).json({ products , total: products.length });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.deleteProductName = async (req, res) => {
  try {
    const { productNameId } = req.params;

    const product = await productNameModel.findById(productNameId);
    if(!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if(product.delete) {
      return res.status(400).json({ message: "Product already deleted" });
    }

    product.delete = true;
    await product.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.updateProductName = async (req, res) => {
  try {
    const { product } = req.body;
    const { productNameId } = req.params;

    const existingProduct = await productNameModel.findById(productNameId);

    if (!existingProduct) {
      return res.status(400).json({ message: "Product not found" });
    }

    if(existingProduct.delete) {
      return res.status(400).json({ message: "Product already deleted" });
    }

    const updatedProduct = await productNameModel.findByIdAndUpdate(productNameId, { product }, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.getAllPaperQuality = async (req,res) =>{
  try {
    const paperQuality = await paperQualityModel.find({ delete: false });

    res.status(200).json({ paperQuality , total: paperQuality.length });
  } catch (error) {
    console.error('Error getting paper quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.addNewPaperQuality  = async (req,res) =>{
  try {
    const { product , productNameId } = req.body;

    const existingPaperQuality = await paperQualityModel.findOne({ paperQuality: product , productNameId });
    const rank = await paperQualityModel.countDocuments({delete : false}) + 1;

    if(existingPaperQuality){
      if(existingPaperQuality.delete){
        existingPaperQuality.delete = false;
        await existingPaperQuality.save();
        return res.status(201).json({message : "Created successfully"});
      }
      return res.status(400).json({ message: "paper quality already exists" });
    }

    const newPaperQuality = new paperQualityModel({ paperQuality: product , productNameId ,rank });

    await newPaperQuality.save();
    res.status(201).json({ message: 'New Paper Quality created successfully', paperQuality: newPaperQuality });
  } catch (error) {
    console.error('Error creating Paper Quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.DeletePaperQuality = async (req,res) =>{
  try {
    const { paperQualityId } = req.params;

    const paperQuality = await paperQualityId.findById(paperQualityId);

    if (!paperQuality) {
      return res.status(404).json({ message: 'Paper Quality not found' });
    }

    if(paperQuality.delete){
      return res.status(400).json({ message: "Paper Quality already deleted" });
    }

    paperQuality.delete = true;
    await paperQuality.save();

    res.status(200).json({ message: 'Paper Quality deleted successfully' });
  } catch (error) {
    console.error('Error deleting Paper Quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.getallProducts = async (req,res) =>{
  try{
    const products = await  productModel.find({delete: false});
     res.status(200).json({products , total: products.length});
  } catch (error){
    console.log('Error getting products:',error);
    res.status(500).json({ message:'Internal Server error' });
  }
}
exports.getAllQuantity = async(req,res) =>{
  try {
    const quantity = await quantityModel.find({delete: false});

    res.status(200).json({ quantity , total: quantity.length});
  } catch (error) {
    console.error('Error getting quantity:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}


exports.addNewQuantity = async (req,res) =>{
  try {
    const { product , productNameId } = req.body;

   const productName = await productNameModel.findById(productNameId);

    if (!productName) {
      return res.status(400).json({ message: 'product Name not found' });
    }
    const rank = await quantityModel.countDocuments({}) + 1;

    const existingQuantity = await quantityModel.findOne({ quantity : product , productNameId });
    if(existingQuantity){
      if(existingQuantity.delete){
        existingQuantity.delete = false;
        await existingQuantity.save();
        return res.status(201).json({message : "Created successfully"});
      }
      return res.status(400).json({ message: "Quantity already exists" });
    }

    const newQuantity = new quantityModel({ quantity : product , rank , productNameId });

    await newQuantity.save();
    res.status(201).json({ message: 'quantity created successfully', quantity: newQuantity });
  } catch (error) {
    console.error('Error creating quantity:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.DeleteQuantity = async (req,res) =>{
  try {
    const { quantityId } = req.params;

    const quantity = await quantityModel.findById(quantityId);

    if (!quantity) {
      return res.status(404).json({ message: 'quantity not found' });
    }

    if(quantity.delete){
      return res.status(400).json({ message: 'quantity already deleted' });
    }

    quantity.delete = true;
    await quantity.save();

    res.status(200).json({ message: 'quantity deleted successfully' });
  } catch (error) {
    console.error('Error deleting quantity:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.getAllCoverPaperQuality = async (req,res) =>{
  try {
    const coverPaperQuality = await coverPaperQualityModel.find({delete: false});

    res.status(200).json({ coverPaperQuality , total: coverPaperQuality.length});
  } catch (error) {
    console.error('Error getting paper quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}


exports.addNewCoverPaperQuality = async (req, res) => {
  try {
    const { product , productNameId } = req.body;
    const existingCoverPaperQuality = await coverPaperQualityModel.findOne({ coverPaperQuality : product , productNameId });
    const rank = await coverPaperQualityModel.countDocuments({}) + 1;

    if (existingCoverPaperQuality) {
        if(existingCoverPaperQuality.delete){
          existingCoverPaperQuality.delete = false;
          existingCoverPaperQuality.rank = rank;
          await existingCoverPaperQuality.save();
          return res.status(201).json({message : "Created successfully"});
        }
      return res.status(400).json({ message: 'Cover Paper Quality already exists' });
    }

    const productName = await productNameModel.findById(productNameId);
    if (productName.productName !== 'BOOK' && productName.productName !== 'WALL CALENDAR') {
      return res.status(404).json({ message: 'Cover Paper Quality only will add for Book and Wall Calendar' });
    }
    const newCoverPaperQuality = new coverPaperQualityModel({ coverPaperQuality : product , productNameId , rank });

    await newCoverPaperQuality.save();
    res.status(201).json({ message: 'New Cover Paper Quality created successfully', coverPaperQuality: newCoverPaperQuality });
    
  } catch (error) {
    console.error('Error creating Cover Paper Quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};


exports.DeleteCoverPaperQuality = async (req,res) =>{
  try {
    const { coverPaperQualityId } = req.params;

    const coverPaperQuality = await coverPaperQualityModel.findById(coverPaperQualityId);

    if (!coverPaperQuality) {
      return res.status(404).json({ message: 'Cover Paper Quality not found' });
    }

    if(coverPaperQuality.delete){
      return res.status(400).json({ message: 'Cover Paper Quality already deleted' });
    }

    coverPaperQuality.delete = true;
    await coverPaperQuality.save();

    res.status(200).json({ message: 'Cover Paper Quality deleted successfully' });
  } catch (error) {
    console.error('Error deleting Cover Paper Quality:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

exports.getAllValuesToAddProduct = async (req,res) =>{
    
  try {
    const {productNameId} = req.params;
    const product = await productNameModel.findById(productNameId);
    const size = await sizeModel.find({delete: false , productNameId:productNameId}).sort({rank:1}).lean();
    const paperQuality = await paperQualityModel.find({delete: false , productNameId:productNameId}).sort({rank:1}).lean();
    const coverPaperQuality = await coverPaperQualityModel.find({delete: false , productNameId:productNameId}).sort({rank:1}).lean();
    const quantity = await quantityModel.find({delete: false , productNameId:productNameId}).sort({rank:1}).lean();
    const data = {
      product : product,
      size : size,
      paperQuality : paperQuality,
      coverPaperQuality : coverPaperQuality,
      quantity : quantity
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getting values to add product:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }

}

// exports.createProduct = async (req, res) => {
//   try {
//     let { productNameId, paperQuality, coverPaperQuality, gst, side, priceMatrix } = req.body;

//     if (!coverPaperQuality || coverPaperQuality === "null" || coverPaperQuality === "") {
//       coverPaperQuality = null;
//     }

//     if (typeof priceMatrix === "string") {
//       try {
//         priceMatrix = JSON.parse(priceMatrix);
//       } catch (error) {
//         console.error("JSON Parse Error:", error.message);
//         return res.status(400).json({
//           status: false,
//           message: "Invalid JSON format for priceMatrix",
//           error: error.message,
//         });
//       }
//     }



//     const productName = await productNameModel.findById(productNameId);
//     if (!productName) {
//       return res.status(400).json({
//         status: false,
//         message: "Product not found",
//       });
//     }

//     if (!productNameId || !side || !gst || !Array.isArray(priceMatrix) || priceMatrix.length === 0) {
//       return res.status(400).json({
//         status: false,
//         message: "Missing required fields or invalid priceMatrix",
//       });
//     }

//     const duplicateCheckFilter = {
//       productNameId,
//       side,
//       paperQuality,
//       delete: false,
//     };

//     if (coverPaperQuality) {
//       duplicateCheckFilter.coverPaperQuality = coverPaperQuality;
//     }

//     const existingProducts = await productModel.find({
//       ...duplicateCheckFilter,
//       $or: priceMatrix.map((item) => ({
//         size: item.sizeId,
//         quantity: item.quantity,
//       })),
//     });

//     const existingCombinations = new Set();
//     const existingProductDetails = [];

//     existingProducts.forEach((product) => {
//       const key = `${product.size}_${product.quantity}`;
//       existingCombinations.add(key);
//       existingProductDetails.push({
//         id: product._id,
//         size: product.size,
//         quantity: product.quantity,
//         price: product.price,
//       });
//     });

//     const newProductMatrix = priceMatrix.filter((item) => {
//       const key = `${item.sizeId}_${item.quantity}`;
//       return !existingCombinations.has(key);
//     });

//     if (newProductMatrix.length === 0) {
//       return res.status(400).json({
//         status: false,
//         message: "All products already exist in the database",
//         existingProducts: existingProductDetails,
//       });
//     }

//     let pictureUrl;
//     if (req.file) {
//       try {
//         const fileStr = req.file.buffer.toString("base64");
//         const fileType = req.file.mimetype;
//         const fileUri = `data:${fileType};base64,${fileStr}`;

//         const result = await cloudinary.uploader.upload(fileUri, {
//           folder: "products",
//           resource_type: "auto",
//         });

//         pictureUrl = result.secure_url;
//       } catch (uploadError) {
//         return res.status(500).json({
//           status: false,
//           message: "Failed to upload image",
//           error: uploadError.message,
//         });
//       }
//     }

//     const productsToInsert = newProductMatrix.map((item) => {
//       const product = {
//         productNameId,
//         paperQuality,
//         size: item.sizeId,
//         gst: Number(gst),
//         side,
//         price: item.price,
//         quantity: item.quantity,
//         productImage: productName.image || pictureUrl || undefined,
//       };

//       if (coverPaperQuality) {
//         product.coverPaperQuality = coverPaperQuality;
//       }

//       return product;
//     });

//     const createdProducts = await productModel.insertMany(productsToInsert);

//     return res.status(201).json({
//       status: true,
//       message: `${createdProducts.length} new product(s) created successfully. ${existingProductDetails.length} product(s) already existed.`,
//       newProductsCount: createdProducts.length,
//       existingProductsCount: existingProductDetails.length,
//       existingProducts: existingProductDetails,
//     });

//   } catch (error) {
//     console.error("Create Product Error:", error);

//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };


exports.createProduct = async (req, res) => {
  try {
    let { productNameId, paperQuality, coverPaperQuality, gst, side, priceMatrix } = req.body;

    if (!coverPaperQuality || coverPaperQuality === "null" || coverPaperQuality === "") {
      coverPaperQuality = null;
    }

    if (typeof priceMatrix === "string") {
      try {
        priceMatrix = JSON.parse(priceMatrix);
      } catch (error) {
        console.error("JSON Parse Error:", error.message);
        return res.status(400).json({
          status: false,
          message: "Invalid JSON format for priceMatrix",
          error: error.message,
        });
      }
    }

    const productName = await productNameModel.findById(productNameId);
    if (!productName) {
      return res.status(400).json({
        status: false,
        message: "Product not found",
      });
    }

    if (!productNameId || !side || !gst || !Array.isArray(priceMatrix) || priceMatrix.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields or invalid priceMatrix",
      });
    }

    // Process each item in the priceMatrix individually to check for exact duplicates
    const results = {
      newProducts: [],
      reactivatedProducts: [],
      existingProducts: []
    };

    // Upload image once if provided
    let pictureUrl;
    if (req.file) {
      try {
        const fileStr = req.file.buffer.toString("base64");
        const fileType = req.file.mimetype;
        const fileUri = `data:${fileType};base64,${fileStr}`;

        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "products",
          resource_type: "auto",
        });

        pictureUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          status: false,
          message: "Failed to upload image",
          error: uploadError.message,
        });
      }
    }

    // Process each matrix item
    for (const item of priceMatrix) {
      // Check for duplicate (including both active and deleted products)
      const duplicateFilter = {
        productNameId,
        paperQuality,
        size: item.sizeId,
        quantity: item.quantity,
        side,
        gst: Number(gst),
        price: item.price
      };

      if (coverPaperQuality) {
        duplicateFilter.coverPaperQuality = coverPaperQuality;
      }

      // First check for exact duplicate (including price)
      const existingProduct = await productModel.findOne(duplicateFilter);

      if (existingProduct) {
        // Product exists, check if it's marked as deleted
        if (existingProduct.delete === true) {
          // Reactivate the product
          existingProduct.delete = false;
          await existingProduct.save();
          results.reactivatedProducts.push({
            id: existingProduct._id,
            size: existingProduct.size,
            quantity: existingProduct.quantity,
            price: existingProduct.price
          });
        } else {
          // Product already exists and is active
          results.existingProducts.push({
            id: existingProduct._id,
            size: existingProduct.size,
            quantity: existingProduct.quantity,
            price: existingProduct.price
          });
        }
      } else {
        // No duplicate, create new product
        const newProduct = {
          productNameId,
          paperQuality,
          size: item.sizeId,
          quantity: item.quantity,
          side,
          gst: Number(gst),
          price: item.price,
          productImage: productName.image || pictureUrl || undefined,
          delete: false
        };

        if (coverPaperQuality) {
          newProduct.coverPaperQuality = coverPaperQuality;
        }

        results.newProducts.push(newProduct);
      }
    }

    // Insert new products if any
    if (results.newProducts.length > 0) {
      const createdProducts = await productModel.insertMany(results.newProducts);
      
      // Update the results with the created product IDs
      results.newProducts = createdProducts.map(product => ({
        id: product._id,
        size: product.size,
        quantity: product.quantity,
        price: product.price
      }));
    }

    return res.status(201).json({
      status: true,
      message: `${results.newProducts.length} new product(s) created, ${results.reactivatedProducts.length} product(s) reactivated, ${results.existingProducts.length} product(s) already exist.`,
      newProductsCount: results.newProducts.length,
      reactivatedProductsCount: results.reactivatedProducts.length,
      existingProductsCount: results.existingProducts.length,
      newProducts: results.newProducts,
      reactivatedProducts: results.reactivatedProducts,
      existingProducts: results.existingProducts
    });

  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProducts = async (req,res) =>{
  try {
    const products = await productModel.find({delete : false}).populate('productNameId','productName').populate('paperQuality','paperQuality').populate('size','size').populate('coverPaperQuality','coverPaperQuality').sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({message : "Internal Server error", error : error.message});
  }
}

exports.getProductsUserByAdmin = async (req, res) => {
  try {
    const products = await productModel
      .find({ delete: false })
      .populate("productNameId", "productName")
      .select("productNameId")
      .sort({ createdAt: -1 });

    const uniqueProducts = [];
    const productSet = new Set();

    products.forEach((product) => {
      if (product.productNameId && !productSet.has(product.productNameId.productName)) {
        productSet.add(product.productNameId.productName);
        uniqueProducts.push(product);
      }
    });
    const users = await userModel.find({ delete: false }).select("userNumber name businessName");

    return res.status(200).json({ products: uniqueProducts, users });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error", error: error.message });
  }
};

exports.getProductscrm = async(req,res)=>{
  try {
    const {productNameId} = req.params;
    if(!productNameId){
      return res.status(400).json({message : "id is missing"});
    }
    const products = await productModel.find({delete : false,productNameId}).populate('productNameId','productName').populate('paperQuality','paperQuality').populate('size','size').populate('coverPaperQuality','coverPaperQuality').sort({ createdAt: -1 });

    return res.status(200).json({message : "get all same kind of product",products});
  } catch (error) {
    return res.status(500).json({message:error});
  }
}


exports.CreateOrderByAdmin = async (req,res) =>{
    const { productId,userId,otherProduct ,remark , jobName , fullJobDetails , size, paperQuality, quantity, side, gst, price, gstAmount, numberOfPages ,coverPaperQuality , totalAmount , proId } = req.body;
    try {
     
      let finalProductId = null;
      let product=null;
    if (proId && mongoose.Types.ObjectId.isValid(proId)) {
       product = await productModel.findById(proId).populate('productNameId','productName').populate('paperQuality','paperQuality').populate('size','size').populate('coverPaperQuality','coverPaperQuality');
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      finalProductId = productId;
    } else {
      if (!otherProduct) {
        return res.status(400).json({ message: "Other product details are required" });
      }
      finalProductId = 'other';
    }

      const orderCount = await orderModel.countDocuments();
      const uniqueOrderNumber = String(orderCount + 1).padStart(4, '0');
      
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }
      let totalBalance = Number(user?.balance?.toFixed()) + Number(user?.creditLimit?.toFixed());
    const paymentOfOrder = totalBalance >= totalAmount;
    if (paymentOfOrder) {
        if (user.balance >= totalAmount) {
          user.balance -= totalAmount;
        } else {
          let remainingAmount = totalAmount - user.balance;
          user.creditLimit -= remainingAmount;
          user.balance = 0;
        }
    await user.save();
  }

   let imageUrls = {
        frontImage: null,
        backImage: null,
        frontCoverImage: null,
        backCoverImage: null
      };
  
  
      if (req.files) {
        const uploadPromises = [];
        const uploadFile = async (file) => {
          if (!file) return null;
          try {
            const fileStr = file.buffer.toString("base64");
            const fileType = file.mimetype;
            const fileUri = `data:${fileType};base64,${fileStr}`;
  
            const result = await cloudinary.uploader.upload(fileUri, {
              folder: "orders",
              resource_type: "auto",
            });
  
            return result.secure_url;
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload ${file.fieldname}`);
          }
        };
  
        const fileTypes = ['frontImage', 'backImage', 'frontCoverImage', 'backCoverImage'];
        for (const fileType of fileTypes) {
          if (req.files[fileType] && req.files[fileType][0]) {
            uploadPromises.push(
              uploadFile(req.files[fileType][0])
                .then(url => {
                  imageUrls[fileType] = url;
                })
            );
          }
        }
  
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }
      }
      
      const newOrder = new orderModel({
        userId,
        productId : proId || finalProductId,
        otherProduct,
        fullJobDetails,
        jobName,
        remarks:remark,
        status: "Job Placed",
        numberOfPages,
        uniqueOrderNumber,
        quantity,
        size : product?.size?.size || size,
        paperQuality : product?.paperQuality?.paperQuality || paperQuality,
        side,
        price,
        paymentVerification: paymentOfOrder,
        byWebsite:false,
        totalAmount,
        paidByWallet : paymentOfOrder,
        gstAmount : Number(gstAmount).toFixed(),
        gst,
        coverPaperQuality,
        ...imageUrls
          });
  
      await newOrder.save();
      res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'server error' });
    }
  };

  exports.UpdateOrderByAdmin = async (req, res) => {
    const orderId = req.params.id;
    try {
      const {
        size,
        paperQuality,
        coverPaperQuality,
        side,
        quantity,
        price,
        gst,
        gstAmount,
        totalAmount,
        jobName,
        fullJobDetails,
        remark,
        numberOfPages
      } = req.body;
  
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(400).json({ message: "Order not found" });
      }
  
      let imageUrls = {
        frontImage: order.frontImage,
        backImage: order.backImage,
        frontCoverImage: order.frontCoverImage,
        backCoverImage: order.backCoverImage
      };
  
      if (req.files) {
        const uploadPromises = [];
        const uploadFile = async (file) => {
          if (!file) return null;
          try {
            const fileStr = file.buffer.toString("base64");
            const fileType = file.mimetype;
            const fileUri = `data:${fileType};base64,${fileStr}`;
  
            const result = await cloudinary.uploader.upload(fileUri, {
              folder: "orders",
              resource_type: "auto",
            });
  
            return result.secure_url;
          } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload ${file.fieldname}`);
          }
        };
  
        const fileTypes = ['frontImage', 'backImage', 'frontCoverImage', 'backCoverImage'];
        for (const fileType of fileTypes) {
          if (req.files[fileType] && req.files[fileType][0]) {
            uploadPromises.push(
              uploadFile(req.files[fileType][0])
                .then(url => {
                  imageUrls[fileType] = url;
                })
            );
          }
        }
  
        if (uploadPromises.length > 0) {
          await Promise.all(uploadPromises);
        }
      }
  
      // Update order with new values
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          fullJobDetails,
          jobName,
          remarks: remark,
          quantity,
          size,
          paperQuality,
          side,
          price,
          totalAmount: Number(totalAmount).toFixed(2),
          gstAmount: Number(gstAmount).toFixed(2),
          gst,
          numberOfPages,
          coverPaperQuality,
          frontImage: imageUrls.frontImage,
          backImage: imageUrls.backImage,
          frontCoverImage: imageUrls.frontCoverImage,
          backCoverImage: imageUrls.backCoverImage,
          updatedAt: new Date()
        },
        { new: true }
      );
  
      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        order: updatedOrder
      });
  
    } catch (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({
        success: false,
        message: "Error in updating order",
        error: error.message
      });
    }
  };


  exports.numberOfAdminAndCust = async (req, res) => {
    try {
      const totalAdmin = await adminModel.countDocuments();
      const totalCustomer = await userModel.countDocuments();
  
      res.status(200).json({
        admins: totalAdmin,
        customers: totalCustomer
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
      res.status(500).json({
        message: "Server Error",
        error: error.message
      });
    }
  };
  

  exports.updateValue = async (req,res) =>{
    try {
      const {id} = req.params;
      const {activeButton , value} = req.body;
      let pictureUrl;
      if (req.file) {
        try {
          const fileStr = req.file.buffer.toString("base64");
          const fileType = req.file.mimetype;
          const fileUri = `data:${fileType};base64,${fileStr}`;
  
          const result = await cloudinary.uploader.upload(fileUri, {
            folder: "products",
            resource_type: "auto",
          });
  
          pictureUrl = result.secure_url;
        } catch (uploadError) {
          return res.status(500).json({
            status: false,
            message: "Failed to upload image",
            error: uploadError.message,
          });
        }
      }
      let data;
      if(activeButton === "Product Name"){
        data = await productNameModel.findById(id)
        data.productName = value;
        data.image = pictureUrl || data.image
      }else if(activeButton === "Size"){
        data = await sizeModel.findById(id);
        data.size = value;
      }else if(activeButton === "Quantity"){
        data = await quantityModel.findById(id);
        data.quantity = value
      }else if(activeButton === "Paper Quality"){
        data = await paperQualityModel.findById(id);
        data.paperQuality = value;
      }else{
        data = await coverPaperQualityModel.findById(id);
        data.coverPaperQuality = value;
      }
      if(!data){
     return res.status(400).json({ message: "data not found"});
      }
      await data.save();
      res.status(200).json({ message: "data updated"});

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'server error' });
    }
  }

  exports.deleteProductAccessories = async (req,res) =>{
    try {
      const {id} = req.params;
      const {activebutton} = req.headers;
      let data;
      console.log(id , activebutton)
      if(activebutton === "Product Name"){
        data = await productNameModel.findById(id)
        if(data){
          data.delete = true;
        }
      }else if(activebutton === "Size"){
        data = await sizeModel.findById(id);
        if(data){
          data.delete = true;
        }
      }else if(activebutton === "Quantity"){
        data = await quantityModel.findById(id);
        if(data){
          data.delete = true;
        }
      }else if(activebutton === "Paper GSM Type"){
        data = await paperQualityModel.findById(id);
        if(data){
          data.delete = true;
        }
      }else{
        data = await coverPaperQualityModel.findById(id);
        if(data){
          data.delete = true;
        }
      }
      if(!data){
     return res.status(400).json({ message: "data not found"});
      }
      await data.save();
      res.status(200).json({ message: "data deleted"});

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'server error' });
    }
  }

  exports.GetAllOrder = async (req, res) => {
    try {
      let orders = await orderModel
        .find({ delete: false })
        .populate("userId")
        .lean(); 
      const validOrders = [];
      const invalidOrders = [];
  
      orders.forEach((order) => {
        if (mongoose.Types.ObjectId.isValid(order.productId)) {
          validOrders.push(order);
        } else {
          invalidOrders.push(order); 
        }
      });
  
      const populatedOrders = await orderModel.populate(validOrders, {
        path: "productId",
        populate: [
          { path: "productNameId", select: "productName" },
          { path: "paperQuality", select: "paperQuality" },
          { path: "size", select: "size" },
          { path: "coverPaperQuality", select: "coverPaperQuality" },
        ],
      });
  
      const finalOrders = [...populatedOrders, ...invalidOrders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );;
  
      res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

  exports.getTerms = async (req, res) => {
    try {
      const terms = await termsModel.find({delete: false}).sort({ rank: 1 });
      res.status(200).json({message : "data successfully uploaded",terms});
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ message: "server error" });
    }
  };

exports.addTerms = async (req, res) => {
  try {
    const { terms } = req.body;
    const rank = await termsModel.countDocuments({}) + 1;
    const newTerms = new termsModel({ terms, rank });
    await newTerms.save();
    res.status(201).json({ message: "Terms added successfully", terms: newTerms });
  } catch (error) {
    console.error("Error adding terms:", error);
    res.status(500).json({ message: "server error" });
  }
};

exports.deleteTerms = async (req, res) => {
  try {
    const { termsId } = req.params;
    const terms = await termsModel.findById(termsId);
    if (!terms) {
      return res.status(404).json({ message: "Terms not found" });
    }
    if(terms.delete){
      return res.status(400).json({ message: "Terms already deleted" });
    }
    terms.delete = true;
    await terms.save();
    res.status(200).json({ message: "Terms deleted successfully" });
  } catch (error) {
    console.error("Error deleting terms:", error);
    res.status(500).json({ message: "server error" });
  }
};

exports.updateTerms = async (req, res) => {
  try {
    const { termsId } = req.params;
    const { term } = req.body;
    const terms = await termsModel.findById(termsId);
    if (!terms) {
      return res.status(404).json({ message: "Terms not found" });
    }
    if(terms.delete){
      return res.status(400).json({ message: "Terms already deleted" });
    }
    terms.terms = term;
    await terms.save();
    res.status(200).json({ message: "Terms updated successfully", terms });
  } catch (error) {
    console.error("Error updating terms:", error);
    res.status(500).json({ message: "server error" });
  }
};

exports.updateRanks = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await termsModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRanksVissionMissionPolicy = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await visionModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRanksPaymentPolicy = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await paymentModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksOwnDetails = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await ownDetailsModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksHomePageDetails = async (req, res) => { 
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await InfoModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksAbout = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await aboutModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksProductName = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      const updatedItem = await productNameModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksSize = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await sizeModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksPaperQuality = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await paperQualityModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksCoverPaperQuality = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await coverPaperQualityModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateRanksQuantity = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid data format. Expected 'items' array." });
    }
    
    // Process each item update
    const updatePromises = items.map(async (item) => {
      const { id, rank } = item;
      
      if (!id || rank === undefined) {
        throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
      }
      
      // Find and update the item with new rank
      const updatedItem = await quantityModel.findById(id);
      
      if (!updatedItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      if (updatedItem.delete) {
        throw new Error(`Item with ID ${id} is already deleted`);
      }
      
      // Update the rank
      updatedItem.rank = rank;
      return updatedItem.save();
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    // Return success response
    res.status(200).json({ 
      message: "Ranks updated successfully",
      updatedCount: items.length
    });
    
  } catch (error) {
    console.error("Error updating ranks:", error);
    
    // Handle specific error messages
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("already deleted")) {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message && error.message.includes("Invalid item data")) {
      return res.status(400).json({ message: error.message });
    }
    
    // Generic server error
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateBalance = async (req, res) => {
  const { userId } = req.params;
  const { balance, refName, date, paymentType } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified === false) {
      return res.status(400).json({ message: "Please verify your email" });
    }

    if (balance === undefined || balance === null || balance === "") {
      return res.status(400).json({ message: "Amount value is not found" });
    }

    if (user.deleteUser) {
      return res.status(400).json({ message: "Your account has been deleted" });
    }

    let numericBalance = Number(balance);
    let remainingBalance = numericBalance;

    // If balance is positive, try topping up creditLimit first
    if (numericBalance > 0 && user.creditLimit < user.maxCreditLimit) {
      const creditDeficit = user.maxCreditLimit - user.creditLimit;

      if (remainingBalance >= creditDeficit) {
        user.creditLimit = user.maxCreditLimit;
        remainingBalance -= creditDeficit;
      } else {
        user.creditLimit += remainingBalance;
        remainingBalance = 0;
      }
    }

    // If balance is negative, prevent overdraft
    if (numericBalance < 0 && (user.balance + numericBalance) < 0) {
      return res.status(400).json({ message: "Insufficient user balance for this deduction" });
    }

    // Update main balance with remaining (could be positive or negative)
    if (remainingBalance !== 0) {
      user.balance = Number((Number(user.balance) + remainingBalance).toFixed(2));
    }

    // Log the transaction
    const updateBalance = new userBalanceModel({
      userId,
      balance: numericBalance,
      paymentType,
      referenceName: refName,
      date,
    });

    await updateBalance.save();
    await user.save();

    res.status(200).json({ message: "Amount updated successfully", user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};



exports.updateUserProfile = async (req,res) => {
  try {
    const {id} = req.params;
    const {maxCreditLimit} = req.body;
    const user = await userModel.findById(id);
    if(!user){
      return res.status(400).json({message : "customer not found"})
    }
    if (user.creditLimit != user.maxCreditLimit) {
          return res.status(400).json({ message: "First settle your previous credit amount." });
      }
    await userModel.findByIdAndUpdate(id,req.body);
    user.creditLimit = maxCreditLimit;
    user.maxCreditLimit= maxCreditLimit;
    await user.save();
    return res.status(200).json({message : "User updated successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message : "server error"})
  }
}

exports.getAllValues = async (req,res) =>{
  try {
    const productName = await productNameModel.find({delete:false}).sort({rank : 1});
    const size = await sizeModel.find({delete:false}).populate("productNameId" , "productName image").sort({rank : 1});
    const paperQuality = await paperQualityModel.find({delete:false}).populate("productNameId" , "productName image").sort({rank : 1});
    const coverPaperQuality = await coverPaperQualityModel.find({delete:false}).populate("productNameId" , "productName image").sort({rank : 1});
    const quantity = await quantityModel.find({delete:false}).populate("productNameId" , "productName image").sort({rank : 1});
    
    const data = {
      productName,size,paperQuality,coverPaperQuality,quantity
    }

    res.status(200).json({message : "All Data" , data})

  } catch (error) {
    console.log(error);
    res.status(500).json({error})
  }
}


exports.getUserBalance = async (req, res) => {
  const { userId } = req.params;

  try {
     const userTransactions = await userBalanceModel
        .find({ userId })
        .populate("userId", "name userNumber")
        .lean();

     const userOrders = await orderModel
        .find({ userId })
        .select("userId createdAt totalAmount")
        .populate("userId", "name userNumber")
        .lean();

     // Function to convert UTC to IST with date change
     const convertToIST = (utcDate) => {
        if (!utcDate) return null;
        
        // Create a new Date object from the UTC date
        const date = new Date(utcDate);
        
        // Apply IST offset (UTC+5:30)
        const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60000);
        
        return istDate;
     };

     const taggedTransactions = userTransactions.map(transaction => ({
        ...transaction,
        createdAt: convertToIST(transaction.createdAt),
        recordType: 'transaction'
     }));

     const taggedOrders = userOrders.map(order => ({
        ...order,
        createdAt: convertToIST(order.createdAt),
        recordType: 'order'
     }));

     const combinedData = [...taggedTransactions, ...taggedOrders];
     
     // Sort by the converted IST date
     combinedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

     // Optional: Format the date if needed
     const formattedData = combinedData.map(item => ({
        ...item,
        formattedCreatedAt: item.createdAt.toLocaleDateString('en-IN', {
           day: '2-digit',
           month: '2-digit',
           year: 'numeric'
        }).replace(/\//g, '-')
     }));

     const data = {
        combinedActivity: formattedData
     };

     res.status(200).json({ data });
  } catch (error) {
     console.error("Error in getUserBalance:", error.message);
     res.status(500).json({ error: error.message });
  }
};


exports.updateOrderField = async (req, res) => {
  const {fieldName, newValue } = req.body;
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order[fieldName] = newValue;
    await order.save();
    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order', error });
  }
}

exports.updateOrderMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.message = message;
    await order.save();

    res.status(200).json({ message: "Order message updated successfully", order });
  } catch (error) {
    console.error("Error updating order message:", error);
    next(error);
  }
};

exports.updateOrderStatus = async (req,res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if(!order.paymentVerification){
      return res.status(400).json({message : "First complete the payment"})
    }
    if(order.status === "Job Placed"){
      if(order.jobName === "" || order.fullJobDetails === "" || order.printNumber === ""){
        return res.status(400).json({message : "Complete Job Name, Print Number and Job Details first"})
      }
      order.status = "Job In Production";
    }else if(order.status === "Job In Production"){
      order.status = "Binding & Packing";
    }else if(order.status === "Binding & Packing"){
      order.status = "Job Dispatch";
    }else if(order.status === "Job Dispatch"){
      order.status = "Job Deliver";
    }else if(order.status === "Job Deliver"){
      order.status = "Job Complete"
    }
    await order.save();
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status', error });
  }
}

exports.updateCancelOrder = async (req,res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
   if(order.status === "Job Deliver"){
    return res.status(400).json({message : "Order is Already Delivered"})
    }else if(order.status === "Job Complete"){
      return res.status(400).json({message : "Order is Already Completed"})
    }else if(order.status === "Job Cancelled"){
      return res.status(400).json({message : "Order is Already Cancelled"})
    }

    order.status = "Job Cancelled"
    await order.save();
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status', error });
  }
}

exports.updateProduct = async (req,res) => {
  const { productId } = req.params;
  const {gst,price} = req.body;
  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await productModel.findByIdAndUpdate(productId,{gst,price})
    
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error });
  }
}

exports.verifyUser = async (req,res) =>{
  try {
    const {id} = req.params;
    const user = await userModel.findById(id);
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
}

exports.DeleteMarkedProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product IDs" });
    }

    await productModel.updateMany(
      { _id: { $in: productIds } },
      { $set: { delete: true } }
    );

    res.status(200).json({ message: "Selected products marked as deleted" });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.DeleteMarkedOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product IDs" });
    }

    await orderModel.updateMany(
      { _id: { $in: orderIds } },
      { $set: { delete: true } }
    );

    res.status(200).json({ message: "Selected products marked as deleted" });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.DeleteMarkedUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product IDs" });
    }

    await userModel.updateMany(
      { _id: { $in: userIds } },
      { $set: { delete: true } }
    );

    res.status(200).json({ message: "Selected products marked as deleted" });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.DeleteMarkedProductsAcc = async (req, res) => {
  try {
    const { productAccIds ,activeButton } = req.body;

    if (!productAccIds || !Array.isArray(productAccIds) || productAccIds.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product IDs" });
    }

   if(activeButton === "Product Name"){
    await productNameModel.updateMany(
      { _id: { $in: productAccIds } },
      { $set: { delete: true } }
    );
   }else if(activeButton === "Paper Quality"){
    await paperQualityModel.updateMany(
      { _id: { $in: productAccIds } },
      { $set: { delete: true } }
    );
   }else if(activeButton === "Cover Paper Quality"){
    await coverPaperQualityModel.updateMany(
      { _id: { $in: productAccIds } },
      { $set: { delete: true } }
    );
   }else if(activeButton === "Quantity"){
    await quantityModel.updateMany(
      { _id: { $in: productAccIds } },
      { $set: { delete: true } }
    );
   }else{
    await sizeModel.updateMany(
      { _id: { $in: productAccIds } },
      { $set: { delete: true } }
    );
   }

    res.status(200).json({ message: "Selected products marked as deleted" });
  } catch (error) {
    console.error("Error deleting products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};