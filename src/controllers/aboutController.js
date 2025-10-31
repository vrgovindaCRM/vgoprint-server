const createError = require("http-errors");
const aboutModel = require("../models/about.model");

exports.getAbout = async (req,res,next) =>{
    try {
        const about = await aboutModel.find({delete : false}).sort({rank:1});
        if(!about){
            return res.status(400).json({message : "Nothing in About Section"});
        }
        res.status(200).json({message : "fetch data successfully",about})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }
}


exports.createAbout = async (req,res,next) =>{
    const {text} = req.body;
    try {

        if(!text){
            return res.status(400).json({message : "Text is Required"})
        }

        const rank = await aboutModel.countDocuments({}) + 1;
        const about = new aboutModel({text , rank, delete: false});
        await about.save();

        res.status(200).json({message : "data successfully uploaded",about})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }
}


exports.updateAbout = async (req, res, next) => {
    const { aboutId } = req.params;
    const { text } = req.body;
  
    try {
      if (!aboutId) {
        return res.status(400).json({ message: "Id Required" });
      }
       const ab = await aboutModel.findById(aboutId);
       if(!ab){
        return res.status(400).json({ message: "Item not Found" });
       }
       if(ab.delete){
        return res.status(400).json({ message: "Item is already deleted" });
       }
      if (!text) {
        return res.status(400).json({ message: "Text is Required" });
      }
  
      const about = await aboutModel.findByIdAndUpdate(
        aboutId,
        { text },
        { new: true } 
      );
      res.status(200).json({ message: "Updated successfully!", about });
    } catch (error) {
      next(createError(500, "Error in updating about"));
    }
  };
  

exports.deleteAbout = async (req, res, next) => {
    const { aboutId } = req.params;
  
    try {
      if (!aboutId) {
        return res.status(400).json({ message: "Id Required" });
      }
  
      const about = await aboutModel.findById(aboutId);
      if (!about) {
        return res.status(404).json({ message: "Item not Found" });
      }
  
      about.delete = true;
      await about.save();
  
      res.status(200).json({ message: "Deleted successfully!" });
    } catch (error) {
      next(createError(500, "Error in deleting text"));
    }
  };
 