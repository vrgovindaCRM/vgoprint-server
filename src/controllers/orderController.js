const createError = require("http-errors");
const mongoose = require('mongoose');
const { orderModel } = require("../models/order.model");
const  productModel  = require("../models/product.model");
const cloudinary = require('../utils/cloudinary');
const moment = require('moment');
const userModel = require("../models/user.model");
const { adminModel } = require("../models/admin.model");

const streamifier = require("streamifier");

exports.createOrder = async (req, res, next) => {
  const { productId, totalAmount, gst, price, numberOfPages, jobName } = req.body;
  const userId = req.user.userId;

  try {
    if (!productId || !totalAmount || !gst || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const product = await productModel.findById(productId)
      .populate("paperQuality", "paperQuality")
      .populate("side", "side")
      .populate("size", "size");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const user = await userModel.findById(userId).populate("deliveryAddressId", "number");
    if (!user) {
      return res.status(400).json({ message: "Customer Not Found" });
    }
    
    const orderCount = await orderModel.countDocuments();
    const UniqueOrderNumber = String(orderCount + 1).padStart(2, "0");
    
    let imageUrls = {
      frontImage: null,
      backImage: null,
      frontCoverImage: null,
      backCoverImage: null,
      attachFile: null
    };
    
    if (req.files) {
      console.log("Files received:", Object.keys(req.files));
      
      const uploadFile = (file, fieldName) => {
        return new Promise((resolve, reject) => {
          if (!file) return resolve(null);
      
          console.log(`${fieldName} mimetype:`, file.mimetype);
      
          // Determine if this is a PDF or image
          const isPDF = file.mimetype === 'application/pdf';
          const isImage = file.mimetype.startsWith('image/');
          
          // Configure upload options based on file type
          const uploadOptions = {
            folder: "orders",
            resource_type: isPDF ? "raw" : isImage ? "image" : "raw",
          };
          
          if (isPDF) {
            uploadOptions.format = 'pdf';
            uploadOptions.type = 'upload';
            uploadOptions.access_mode = 'public';
          }
      
          const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error(`Cloudinary upload error for ${fieldName}:`, error);
                return reject(new Error(`Failed to upload ${fieldName}`));
              }
              
              // For PDFs, modify the URL to ensure proper handling
              if (isPDF) {
                // Add fl_attachment flag to ensure proper Content-Disposition header
                const pdfUrl = result.secure_url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
                resolve(pdfUrl);
              } else {
                // For images and other files, use the URL as is
                resolve(result.secure_url);
              }
            }
          );
      
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      };
      
      
      // Define which fields are images vs attachments
      const imageFields = ['frontImage', 'backImage', 'frontCoverImage', 'backCoverImage','attachFile'];

      const uploadPromises = imageFields.map(async (fileType) => {
        if (req.files[fileType] && req.files[fileType][0]) {
          try {
            const url = await uploadFile(req.files[fileType][0], fileType);
            imageUrls[fileType] = url;
          } catch (uploadError) {
            console.error(`Error uploading ${fileType}:`, uploadError);
          }
        }
      });
      
      await Promise.all(uploadPromises);
    }
    
    let totalBalance = parseFloat(user.balance) + parseFloat(user.creditLimit);
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
    
    const newOrder = new orderModel({
      userId,
      productId,
      status: "Job Placed",
      jobName,
      numberOfPages: numberOfPages || null,
      gstAmount: gst,
      price,
      totalAmount,
      byWebsite: true,
      gst: product.gst,
      paymentVerification: paymentOfOrder,
      paidByWallet: paymentOfOrder,
      uniqueOrderNumber: UniqueOrderNumber,
      quantity: product.quantity,
      side: product.side,
      deliveryContactNumber: user.deliveryAddressId?.number || null,
      paperQuality: product.paperQuality?.paperQuality || "N/A",
      size: product.size?.size || "N/A",
      ...imageUrls,
    });
    
    await newOrder.save();
    
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
      const order = await orderModel.findById(orderId).populate('productid size').lean();
      res.status(200).json(order);
    
  } catch (error) {
    next(createError(500, "Error getting order"));
  }
};

exports.updateOrderImage = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }

    let imageUrls = {
      frontImage: order.frontImage || null,
      backImage: order.backImage || null,
      frontCoverImage: order.frontCoverImage || null,
      backCoverImage: order.backCoverImage || null
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

    order.frontImage = imageUrls.frontImage;
    order.backImage = imageUrls.backImage;
    order.backCoverImage = imageUrls.backCoverImage;
    order.frontCoverImage = imageUrls.frontCoverImage;

    await order.save();
    
    return res.status(200).json({ 
      message: "Order images updated successfully",
      order
    });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

exports.getOrders = async (req, res, next) => {
  const { userId } = req.user;
  
  try {
    let orders = await orderModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('userId', 'userNumber deliveryAddress')
      .lean()
      .sort({createdAt : -1})
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(createError(500, "Error fetching orders"));
  }
};


exports.getAllOrdersByAdmin = async (req, res, next) => {
  try {
    const orders = await orderModel.find({ delete : false }).populate("userId").populate('productId','productName productImage').populate('size', 'size').populate('paperQuality','paperQuality') // Populate fields according to the schema
      .lean();
    res.status(200).json({message : "fetched...",orders});
  } catch (error) {
    console.error("Error fetching orders:", error); 
    next(createError(500, "Error fetching orders"));
  }
};

exports.getUnbilledJob = async (req,res) =>{
  try {
    const orders = await orderModel.find().populate("userId")
    .sort({ updatedAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];
    const totalOrders = await orderModel.countDocuments({ billNumber: { $ne: "" } });
    res.status(200).json({message : "fetched...",orders : finalOrders,totalOrders});
  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getDeliveredJob = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Job Deliver" , delete : false }).populate("userId")
    .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getDesignJob = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Job Placed" , delete : false }).populate("userId")
    .sort({ createdAt: -1 })
    .lean();  const validOrders = [];
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getCompleteJobs = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Job Complete" , delete : false }).populate("userId")
    .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getBindingJob = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Binding & Packing" , delete : false }).populate("userId")
    .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getCancelledJob = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Job Cancelled" }).populate("userId")
  .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getJobsInProduction = async (req,res) =>{
  try {
    const orders = await orderModel.find({ status : "Job In Production", delete : false }).populate("userId")
  .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });
  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}

exports.getDispatchJobs = async (req,res) =>{
  try {
    const orders = await orderModel.find({status : "Job Dispatch" }).populate("userId")
   .sort({ createdAt: -1 })
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
      select: "productNameId productImage paperQuality size gst side quantity price",
      populate: [
        { path: "productNameId", select: "productName" },
        { path: "size", select: "size" },
        { path: "paperQuality", select: "paperQuality" }
      ]
    });

    const finalOrders = [...populatedOrders, ...invalidOrders];

    res.status(200).json({ message: "Fetched orders successfully", orders: finalOrders });  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({error})
  }
}


exports.repeatOrder = async (req, res, next) => {
  const { orderId } = req.params; 
  const userId = req.user.userId; 

  try {
    const originalOrder = await orderModel.findById(orderId).lean();

    if (!originalOrder) {
      return next(createError(404, "Original order not found"));
    }
    const user = await userModel.findById(userId)

    let totalBalance = Number(user.balance.toFixed()) + Number(user.creditLimit.toFixed());
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

    const orderCount = await orderModel.countDocuments();
    const UniqueOrderNumber = String(orderCount + 1).padStart(4, '0');
        

    const newOrder = {
      userId : userId,
      productId : originalOrder.productId,
      status: "Job Placed",
      numberOfPages: originalOrder.numberOfPages || null,
      gstAmount: originalOrder.gstAmount,
      price: originalOrder.price,
      totalAmount: originalOrder.totalAmount,
      frontImage : originalOrder.frontImage,
      backImage : originalOrder.backImage,
      frontCoverImage : originalOrder.frontCoverImage,
      backCoverImage : originalOrder.backCoverImage,
      byWebsite : true,
      deliveryContactNumber:originalOrder.deliveryContactNumber,
      paymentVerification: paymentOfOrder,
      paidByWallet : paymentOfOrder,
      uniqueOrderNumber: UniqueOrderNumber,
      quantity : originalOrder.quantity.quantity,
      side : originalOrder.side.side,
      paperQuality : originalOrder.paperQuality.paperQuality,
      size : originalOrder.size.size,
      gst : originalOrder.gst,
      gstAmount : originalOrder.gstAmount,
      createdAt: new Date(), 
      updatedAt: new Date(),
    };

    await orderModel.create(newOrder);

    res.status(201).json({
      success: true,
      message: "Order repeated successfully",
    });
  } catch (error) {
    console.error("Error repeating order:", error);
    res.status(500).json({ success: false, message: "Error repeating order" });
  }
};


exports.updatePaymentImage = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  if (!req.file) {
    return next(createError(400, "No file uploaded"));
  }

  try {
    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) {
      return next(createError(404, "Order not found or doesn't belong to the Customer"));
    }
    
    let result;

    if (req.file) {
      const uploadFile = async (file) => {
        if (!file) return null;
        try {
          const fileStr = file.buffer.toString("base64");
          const fileType = file.mimetype;
          const fileUri = `data:${fileType};base64,${fileStr}`;

          const uploadResult = await cloudinary.uploader.upload(fileUri, {
            folder: "orders",
            resource_type: "auto",
          });
          return uploadResult.secure_url;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          throw new Error(`Failed to upload ${file.fieldname}`);
        }
      };

      result = await uploadFile(req.file);
    }

    order.paymentImage = result;
    order.paymentVerification = false;
    await order.save();  

    res.status(200).json({
      success: true,
      message: "Payment image updated successfully",
      data: {
        orderId: order._id,
        paymentImage: order.paymentImage,
      }
    });
  } catch (error) {
    next(createError(500, "Error updating payment image: " + error.message));
  }
};


  exports.updateBackCover = async (req,res) =>{
    const { orderId } = req.params;
    const userId = req.user.userId;
 
    if (!req.file) {
      return res.status(404).json({message : "File not found"})
    }

    try {
      const order = await orderModel.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({message :"Order not found or doesn't belong to the Customer"});
      }

      const result = await cloudinary.uploader.upload(req.file.path);
  
     
      order.backCoverImage = result.secure_url;
      await order.save();
      console.log("uploaded back cover successfully")
      res.status(200).json({
        success: true,
        message: "image updated successfully",
      });
  
    } catch (error) {
      res.status(500).json({error});
    }
  
  }

  exports.updateFrontCover = async (req,res) =>{
    const { orderId } = req.params;
    const userId = req.user.userId;
 
    if (!req.file) {
      return res.status(404).json({message : "File not found"})
    }

    try {
      const order = await orderModel.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({message :"Order not found or doesn't belong to the Customer"});
      }

      const result = await cloudinary.uploader.upload(req.file.path);
  
     
      order.frontCoverImage = result.secure_url;
      await order.save();
      console.log("uploaded back cover successfully")
      res.status(200).json({
        success: true,
        message: "image updated successfully",

      });
     } catch (error) {
      res.status(500).json({error})
     }
  }
  exports.updateProductOrderImage = async (req,res,next) =>{
    const { orderId } = req.params;
    const userId = req.user.userId;
    const { index } = req.body;
    let i;
  
    if (index === 'Two') {
      i = 1;
    } else if (index === 'One') {
      i = 0;
    } else {
      return next(createError(400, "Invalid index value"));
    }
    if (!req.file) {
      return next(createError(400, "No file uploaded"));
    }
  
    try {
     
      const order = await orderModel.findOne({ _id: orderId, userId });
      if (!order) {
        return next(createError(404, "Order not found or doesn't belong to the Customer"));
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'productorder_images',
      });
  
     
      order.productOrderImage[i] = result.secure_url;
     
      await order.save();
      res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: {
          orderId: order._id,
          productOrderImage: order.productOrderImage,
        }
      });
  
    } catch (error) {
      next(createError(500, "Error updating payment image: " + error.message));
    }
  }

exports.updateOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return next(createError(404, "Order not found"));
    }

    Object.assign(order, updates);
    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    next(createError(500, "Error updating order"));
  }
};

// Delete an Order by ID
exports.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return next(createError(404, "Order not found"));
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    next(createError(500, "Error deleting order"));
  }
};

// Change Order Status by ID
exports.changeOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ["Job Placed","Job In Production","Binding & Packing", "Job Dispatch", "Job Deliver", "Job Cancelled"];

    if (!validStatuses.includes(status)) {
      console.log("Invalid status:", status);
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      console.log("Order not found for ID:", orderId);
      return next(createError(404, "Order not found"));
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    next(createError(500, "Error updating order status"));
  }
};

exports.updateOrderMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the message field
    order.message = message;
    await order.save();

    res.status(200).json({ message: "Order message updated successfully", order });
  } catch (error) {
    console.error("Error updating order message:", error);
    next(error);
  }
};

exports.changePaymentVerification = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user.userId;

    const order = await orderModel.findById(orderId);
    if (!order) {
      console.log("Order not found:", orderId);
      return next(createError(404, "Order not found"));
    }

    const user = await userModel.findById(order.userId);
    const admin = await adminModel.findById(adminId);

    if (!admin || !admin.permissions || !admin.permissions.some(perm => ["All", "Customer"].includes(perm))) {
      return res.status(403).json({ message: "Unauthorized: Admin does not have the required permissions" });
    }

    if (order.paymentVerification === true) {
      return res.status(400).json({ message: "Payment verification already done" });
    }

    const totalAmount = order.totalAmount;
    const userBalance = user.balance || 0;
    const userCreditLimit = user.creditLimit || 0;
    const availableFunds = Number(userBalance) + Number(userCreditLimit);

    if (totalAmount <= availableFunds) {
      if (userBalance >= totalAmount) {
        user.balance -= totalAmount;
      } else {
        const remainder = totalAmount - userBalance;
        user.balance = 0;
        user.creditLimit -= remainder;
      }

      order.paymentVerification = true;

      await user.save();
      await order.save();

      return res.status(200).json({ message: "Payment verification updated successfully", order });
    } else {
      return res.status(400).json({ message: "Insufficient Balance." });
    }
  } catch (error) {
    console.error("Error updating payment verification:", error);
    next(createError(500, "Error updating payment verification"));
  }
};



exports.getCurrentMonthOrderCounts = async (req, res, next) => {
  try {
    const totalJobsCount = await orderModel.countDocuments({ delete: false });
    const orderCounts = await orderModel.aggregate([
      {
        $match: { delete: false } 
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const billedOrdersCount = await orderModel.countDocuments({
      billNumber: { $ne: "" },
      delete: false
    });

    const statusCounts = {
      "Total Jobs": totalJobsCount,
      "Job Placed": 0,
      "Job In Production": 0,
      "Binding & Packing": 0,
      "Job Dispatch": 0,
      "Job Deliver": 0,
      "Job Cancelled": 0,
      "Job Complete": 0,
      "Job Billed": billedOrdersCount
    };

    orderCounts.forEach(order => {
      statusCounts[order._id] = order.count;
    });

    res.status(200).json(statusCounts);
  } catch (error) {
    console.error("Error calculating order counts:", error);
    next(createError(500, "Error calculating order counts"));
  }
};



