const createError = require("http-errors");
const ownDetailsModel = require("../models/ownDetails.model");
const cloudinary = require('../utils/cloudinary');

exports.getOwnDetails = async (req,res,next) =>{
    try {
        const ownDetail = await ownDetailsModel.find({delete: false}).sort({rank:1});
        if(!ownDetail){
            return res.status(400).json({message : "No Data Found"});
        }
        res.status(200).json({message : "fetch data successfully",ownDetail})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }
}


// exports.createOwnDetails = async (req,res,next) =>{
//     const {text,heading,subHeading} = req.body;

//     try {
//         let uploadedImage;
//         if (req.file) {
//           // uploadedImage = await cloudinary.uploader.upload(req.file.path);
//         const uploadFile = async (file) => {
//           if (!file) return null;
//           try {
//             const fileStr = file.buffer.toString("base64");
//             const fileType = file.mimetype;
//             const fileUri = `data:${fileType};base64,${fileStr}`;
  
//             const result = await cloudinary.uploader.upload(fileUri, {
//               folder: "orders",
//               resource_type: "auto",
//             });
  
//             return result.secure_url;
//           } catch (error) {
//             console.error('Cloudinary upload error:', error);
//             throw new Error(`Failed to upload ${file.fieldname}`);
//           }
//         };

//         uploadedImage = await uploadFile(req.files[fileType][0]);
//         }else{
//             return res.status(400).json({message : "Image not Found"})
//         }
//         if(!text){
//             return res.status(400).json({message : "Text is Required"})
//         }
//         if(!heading){
//             return res.status(400).json({message : "Heading is Required"})
//         }
//         const rank = await ownDetailsModel.countDocuments({}) + 1;
//         const ownDetail = new ownDetailsModel({text,heading,rank,subHeading, delete: false, ownDetailImage:uploadedImage ? uploadedImage.secure_url : null });
//         await ownDetail.save();

//         res.status(200).json({message : "created successfully",ownDetail})
//     } catch (error) {
//       console.log(error.message)
//         next(createError(500, "Error creating order"));
//     }
// }

exports.createOwnDetails = async (req, res, next) => {
  const { text, heading, subHeading } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image not Found" });
    }
    if (!text) {
      return res.status(400).json({ message: "Text is Required" });
    }
    if (!heading) {
      return res.status(400).json({ message: "Heading is Required" });
    }

    // Convert buffer to base64 and upload to Cloudinary
    const fileStr = req.file.buffer.toString("base64");
    const fileType = req.file.mimetype;
    const fileUri = `data:${fileType};base64,${fileStr}`;

    const uploadedImage = await cloudinary.uploader.upload(fileUri, {
      folder: "ownDetails",
      resource_type: "auto",
    });

    const rank = await ownDetailsModel.countDocuments({}) + 1;

    const ownDetail = new ownDetailsModel({
      text,
      heading,
      rank,
      subHeading,
      delete: false,
      ownDetailImage: uploadedImage.secure_url, // ✅ directly use secure_url
    });

    await ownDetail.save();

    res.status(200).json({
      message: "Created successfully",
      ownDetail,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    next(createError(500, "Error creating order"));
  }
};

// exports.updateOwnDetails = async (req, res, next) => {
//     const { ownDetailsId } = req.params;
//     const { heading, subHeading, text } = req.body;
  
//     try {
//       if (!ownDetailsId) {
//         return res.status(400).json({ message: "Id is required" });
//       }
  
//       const existingOwnDetail = await ownDetailsModel.findById(ownDetailsId);
  
//       if (!existingOwnDetail) {
//         return res.status(404).json({ message: "Item not found" });
//       }

//     if(existingOwnDetail.delete){
//       return res.status(400).json({ message: "Details is already deleted" });
//     }
  
//       let updatedOwnDetail = {
//         heading: heading || existingOwnDetail.heading,
//         subHeading: subHeading || existingOwnDetail.subHeading,
//         text: text || existingOwnDetail.text,
//         ownDetailImage: existingOwnDetail.ownDetailImage 
//       };
  
//       if (req.file) {
//         try {
//           const uploadedImage = await cloudinary.uploader.upload(req.file.path);
//           updatedOwnDetail.ownDetailImage = uploadedImage.secure_url;
//         } catch (uploadError) {
//           return res.status(500).json({ message: "Error uploading image", error: uploadError.message });
//         }
//       }
  
//       const result = await ownDetailsModel.findByIdAndUpdate(ownDetailsId, updatedOwnDetail, { new: true });
  
//       res.status(200).json({ message: "Updated successfully!", ownDetail: result });
//     } catch (error) {
//       console.error(error);
//       next(createError(500, "Error updating own details"));
//     }
//   }

exports.updateOwnDetails = async (req, res, next) => {
  const { ownDetailsId } = req.params;
  const { heading, subHeading, text } = req.body;

  try {
    if (!ownDetailsId) {
      return res.status(400).json({ message: "Id is required" });
    }

    const existingOwnDetail = await ownDetailsModel.findById(ownDetailsId);
    if (!existingOwnDetail) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (existingOwnDetail.delete) {
      return res.status(400).json({ message: "Details is already deleted" });
    }

    let updatedOwnDetail = {
      heading: heading || existingOwnDetail.heading,
      subHeading: subHeading || existingOwnDetail.subHeading,
      text: text || existingOwnDetail.text,
      ownDetailImage: existingOwnDetail.ownDetailImage, // keep old image unless updated
    };

    // ✅ Handle new image upload (memoryStorage)
    if (req.file) {
      try {
        const fileStr = req.file.buffer.toString("base64");
        const fileType = req.file.mimetype;
        const fileUri = `data:${fileType};base64,${fileStr}`;

        const uploadedImage = await cloudinary.uploader.upload(fileUri, {
          folder: "ownDetails",
          resource_type: "auto",
        });

        updatedOwnDetail.ownDetailImage = uploadedImage.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          message: "Error uploading image",
          error: uploadError.message,
        });
      }
    }

    const result = await ownDetailsModel.findByIdAndUpdate(
      ownDetailsId,
      updatedOwnDetail,
      { new: true }
    );

    res.status(200).json({
      message: "Updated successfully!",
      ownDetail: result,
    });
  } catch (error) {
    console.error("Error updating own details:", error);
    next(createError(500, "Error updating own details"));
  }
};

exports.deleteOwnDetails = async (req,res,next) =>{
    const {ownDetailsId} = req.params;
    
    try {

        if(!ownDetailsId){
            return res.status(400).json({message : "Id Required"})
        }
        
        const ownDetail = await ownDetailsModel.findById(ownDetailsId);
        if(!ownDetail){
            return res.status(400).json({message : "Item not Found"})
        }

        if(ownDetail.delete){
            return res.status(400).json({ message: "details is already deleted" });
        }

        ownDetail.delete = true;
        await ownDetail.save();

        res.status(200).json({message:"Deleted successfully!" , ownDetail})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }

}