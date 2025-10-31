const { paymentModel } = require("../models/payment.model")
const cloudinary = require('../utils/cloudinary');


exports.getDetails = async ( req,res) =>{
    try {
        const payment = await paymentModel.find({delete: false}).sort({rank:1});
        if(!payment){
            return res.status(200).json({message : 'No data Found'})
        }

        res.status(200).json({message : "data get successfull",payment});
    } catch (error) {
        res.status(500).json(error)
    }
}


exports.createPayment = async (req,res)=>{
    const {firmName,bankName,ifscCode,accountNumber,branchName} = req.body;
    console.log(req.body)
    try {
        let uploadedImage;
        if (req.file) {
          uploadedImage = await cloudinary.uploader.upload(req.file.path);
        }

        const rank = await paymentModel.countDocuments({}) + 1;

        const payment = new paymentModel({
            bankName,
            ifscCode,
            accountNumber,
            firmName,
            branchName,
            rank,
            QRimage : uploadedImage ? uploadedImage.secure_url : null,
            delete : false
        })    
        await payment.save();
         
        res.status(201).json({message : "data added successfully",payment})
    
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}



exports.updatePayment = async ( req, res) =>{
    const {firmName,bankName,ifscCode,accountNumber,branchName} = req.body;
    const {paymentId} = req.params;
    console.log(req.body);
    console.log(paymentId);
    try {
        let uploadedImage;
        if (req.file) {
          uploadedImage = await cloudinary.uploader.upload(req.file.path);
        }
        const payments = await paymentModel.findById(paymentId);
          
        if(!payments){
           return res.status(400).json({message : "Data not found"});
        }

        if(payments.delete){
            return res.status(400).json({ message: "Data already deleted" });
        }
         await paymentModel.findByIdAndUpdate(paymentId,{
            bankName,
            ifscCode,
            accountNumber,
            firmName,
            branchName,
            QRimage : uploadedImage? uploadedImage.secure_url : null
        })    
        const payment = await paymentModel.findById(paymentId);
        res.status(200).json({message : "updated successfully", payment})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}


exports.deletePayment = async ( req , res ) => {
    const { paymentId} = req.params;

    try {
          const payment = await paymentModel.findById(paymentId);
          
         if(!payment){
            return res.status(400).json({message : "Data not found"});
         }

          if(payment.delete){
            return res.status(400).json({ message: "Data already deleted" });
          }

          payment.delete = true;
          await payment.save();
          res.status(200).json({message: "Deleted successfully",payment})       
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.DeleteQR = async (req,res) =>{
    const {paymentId} = req.params;

    try {
     
      const payment = await paymentModel.findById(paymentId);
     
      if (!payment) {
        return res.status(404).json({ message: 'Payment details not found' });
      }
      if (payment.QRimage) {
       
        const publicId = payment.QRimage.split('/').pop().split('.')[0];
       
        await cloudinary.uploader.destroy(publicId);
  
        payment.QRimage = null;
        await payment.save();
  
        return res.json({ message: 'QR image deleted successfully', payment });
      } else {
        return res.status(400).json({ message: 'No QR image to delete' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
}