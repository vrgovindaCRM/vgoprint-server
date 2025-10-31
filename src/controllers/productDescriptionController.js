const { productDescriptionModel } = require('../models/productDescription.model');
const cloudinary = require('../utils/cloudinary');


exports.createDescription = async (req, res) => {
    try {
      
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = await Promise.all(
                req.files.map(file =>
                    cloudinary.uploader.upload(file.path)
                        .then(result => result.secure_url)
                )
            );
        }

        const { productNameSize, productDescription, specialization } = req.body;
            
         
        const existDescription = await productDescriptionModel.findOne({productNameSize})
        
      if(existDescription){
        console.log('exist');
        return res.status(400).json({message : "Already exist" })
      }


        const parsedProductDescription = JSON.parse(productDescription);
        const parsedSpecialization = JSON.parse(specialization);
        const parsedProductSize = JSON.parse(productNameSize)

        const newDescription = new productDescriptionModel({
            productNameSize : parsedProductSize,
            productDescriptionImage: imageUrls,
            productDescription: parsedProductDescription,
            specialization: parsedSpecialization
        });

        await newDescription.save();
        res.status(201).json(newDescription);
    } catch (error) {
        console.error('Error creating description:', error);
        res.status(500).json({ message: 'An error occurred while creating the description' });
    }
}


exports.getDescription = async (req, res) => {
    const {nameSize} = req.params;
    try {
        const descriptions = await productDescriptionModel.find({productNameSize : nameSize});
        res.status(200).json({message : "data fetch successfully",descriptions});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getDescriptionById = async (req, res) => {
    try {
        const description = await productDescriptionModel.findById(req.params.id);
        if (!description) return res.status(404).json({ message: 'Description not found' });
        res.status(200).json(description);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateProductDescription = async (req, res) => {
    try {
        // Handle image uploads if files are provided
        const imageUrls = req.files ? await Promise.all(
            req.files.map(file =>
                cloudinary.uploader.upload(file.path)
                    .then(result => result.secure_url)
            )
        ) : [];

        // Prepare updated data object
        const updatedData = {};

        // Conditionally parse and add fields if they are present
        if (req.body.productNameSize) {
            updatedData.productNameSize = req.body.productNameSize;
        }

        if (imageUrls.length) {
            updatedData.productDescriptionImage = imageUrls;
        } else if (req.body.productDescriptionImage) {
            updatedData.productDescriptionImage = req.body.productDescriptionImage;
        }

        if (req.body.productDescription) {
            updatedData.productDescription = JSON.parse(req.body.productDescription);
        }

        if (req.body.specialization) {
            updatedData.specialization = JSON.parse(req.body.specialization);
        }

        // Update the document in the database
        const updatedDescription = await productDescriptionModel.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        if (!updatedDescription) return res.status(404).json({ message: 'Description not found' });
        res.status(200).json(updatedDescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.deleteProductDescription = async (req, res) => {
    try {
        const deletedDescription = await productDescriptionModel.findByIdAndDelete(req.params.id);
        if (!deletedDescription) return res.status(404).json({ message: 'Description not found' });
        res.status(200).json({ message: 'Description deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}