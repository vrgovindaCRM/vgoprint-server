const { paperQualityModel } = require("../models/paperQuality.model");
const  productModel  = require("../models/product.model");
const { productNameModel } = require("../models/productName.model");
const cloudinary = require('../utils/cloudinary');
const createError = require('http-errors');

exports.createProduct = async (req, res, next) => {
  try {
    const { productNameId, paperQuality, size, gst, priceList , coverPaperQuality } = req.body;
    const productImage = req.file.path;
    const existingProduct = await productModel.findOne({ productNameId , size , paperQuality , coverPaperQuality });

    if(existingProduct){
      return res.status(400).json({ message: "Product already exists" });
    }

    const parsedPriceList = JSON.parse(priceList);

    const formattedPriceList = {
      single: parsedPriceList.single.map(item => ({
        quantity: item.quantity,
        price: item.price,
        selected: item.selected
      })),
      double: parsedPriceList.double.map(item => ({
        quantity: item.quantity,
        price: item.price,
        selected: item.selected
      }))
    };


    const result = await cloudinary.uploader.upload(productImage);

    const newProductData = {
      productNameId,
      productImage: result.secure_url,
      gst,
      paperQuality,
      size,
      priceList: formattedPriceList ,
      coverPaperQuality : coverPaperQuality
    };

    const newProduct = new productModel(newProductData);
    await newProduct.save();

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.log(error);
    next(createError(500, "Error creating product"));
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await productNameModel.aggregate([
      {
        $lookup: {
          from: "products",
          let: { id: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productNameId", "$$id"] }, delete: false } }
          ],
          as: "matchedProducts",
        },
      },
      {
        $match: {
          "matchedProducts.0": { $exists: true },
        },
      },
      {
        $project: {
          matchedProducts: 0,
        },
      },
    ]);

    res.status(200).json({ products, totalCount: products.length });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(createError(500, "Error getting unique products"));
  }
};



exports.getAllProductDetails = async (req,res,next) => {
  try {
    const products = await productModel.find({delete: false}).populate('size','size _id').populate('paperQuality','paperQuality _id').populate('coverPaperQuality','coverPaperQuality _id');
    res.status(200).json({message : "successfull get data",products})
  } catch (error) {
    next(createError(500, "Error getting unique products"));
  }
}
// exports.getFilterProduct = async (req, res, next) => {
//   try {
//     const { productName } = req.query;

//     if (!productName) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Product name is required" 
//       });
//     }
//     const products = await productModel.find({ 
//       productNameId: productName,
//       delete: false 
//     })
//     .populate("productNameId","productName")
//     .populate("size", "size _id")
//     .populate("paperQuality", "paperQuality _id")
//     .populate("coverPaperQuality", "coverPaperQuality _id")
//     .lean();

//     return res.status(200).json({ 
//       success: true,
//       products,
//       count: products.length
//     });

//   } catch (error) {
//     console.error("Error fetching filtered products:", {
//       error: error.message,
//       stack: error.stack,
//       productName: req.query.productName
//     });
//     return next(createError(500, `Error getting filtered products: ${error.message}`));
//   }
// };

exports.getFilterProduct = async (req, res, next) => {
  try {
    const { productName } = req.query;
    
    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required"
      });
    }
    
    // Get all products matching the criteria
    const products = await productModel.find({
      productNameId: productName,
      delete: false
    })
    .populate("productNameId", "productName")
    .populate("size", "size _id rank")      // Include rank in population
    .populate("paperQuality", "paperQuality _id rank")  // Include rank in population
    .populate("coverPaperQuality", "coverPaperQuality _id rank")  // Include rank in population
    .lean();
    
    // Sort products based on rank from populated fields
    const sortedProducts = products.sort((a, b) => {
      // First sort by size rank, if available
      if (a.size && b.size) {
        if (a.size.rank !== b.size.rank) {
          return a.size.rank - b.size.rank;
        }
      }
      
      // Then sort by paperQuality rank, if available
      if (a.paperQuality && b.paperQuality) {
        if (a.paperQuality.rank !== b.paperQuality.rank) {
          return a.paperQuality.rank - b.paperQuality.rank;
        }
      }
      
      // Finally sort by coverPaperQuality rank, if available
      if (a.coverPaperQuality && b.coverPaperQuality) {
        return a.coverPaperQuality.rank - b.coverPaperQuality.rank;
      }
      
      return 0; // No difference in ranks
    });
    
    return res.status(200).json({
      success: true,
      products: sortedProducts,
      count: sortedProducts.length
    });
    
  } catch (error) {
    console.error("Error fetching filtered products:", {
      error: error.message,
      stack: error.stack,
      productName: req.query.productName
    });
    return next(createError(500, `Error getting filtered products: ${error.message}`));
  }
};


exports.getProductById = async (req, res, next) => {
  try {
      const { productId } = req.params;
      const product = await productModel.findById(productId).lean();

      if (!product) {
          return next(createError(404, "Product not found"));
      }
      if(product.delete){
        return res.status(403).json({message : "Product already deleted"});
      }
      res.status(200).json({ product });
  } catch (error) {
      next(createError(500, "Error getting product"));
  }
};

// Update a product by ID
exports.updateProduct = async (req, res, next) => {
  try {
      const { productId } = req.params;
      const { productName, productImage, paperQuality, size, printingType, quantity } = req.body;

      const product = await productModel.findById(productId);

      if (!product) {
          return next(createError(404, "Product not found"));
      }

      if(product.delete){
        return res.status(403).json({message : "Product already deleted"});
      }

      product.productName = productName || product.productName;
      product.productImage = req.file ? req.file.path : product.productImage; // Assuming productImage is the URL
      product.paperQuality = paperQuality || product.paperQuality;
      product.size = size || product.size;
      product.printingType = printingType || product.printingType;
      product.quantity = quantity || product.quantity;

      await product.save();

      res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
      next(createError(500, "Error updating product"));
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res, next) => {
  try {
      const { productId } = req.params;
      const product = await productModel.findById(productId);

      if (!product) {
          return next(createError(404, "Product not found"));
      }

      if(product.delete){
        return res.status(403).json({message : "Product already deleted"});
      }

      product.delete = true;
      await product.save();
      res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
      next(createError(500, "Error deleting product"));
  }
};


exports.getPaperQuality = async (req,res,next) =>{
  try {
    const productNameId = await productNameModel.find({productName : req.params.productName});
    if(!productNameId){
      return res.status(400).json({message : "Choose other option and add the product name manually"})
    }

    const paperQuality = await paperQualityModel.find({productNameId});
    res.status(200).json({message : "paper quality",paperQuality})
  } catch (error) {
    next(createError(500, "Error deleting product"));
  }
}