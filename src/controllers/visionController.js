const createError = require("http-errors");
const visionModel = require("../models/visionmissionpolicy.model");

exports.getVision = async (req,res,next) =>
{
    try {
        const vision = await visionModel.find({delete: false}).sort({rank: 1});
        if(!vision){
            return res.status(400).json({message : "No Data Found"});
        }
        res.status(200).json({message : "fetch data successfully",vision})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }
}


exports.createVision = async (req,res,next) =>{
    const {text,heading} = req.body;

    try {

        if(!text){
            return res.status(400).json({message : "Text is Required"})
        }
        if(!heading){
            return res.status(400).json({message : "Heading is Required"})
        }
        const rank = await visionModel.countDocuments({}) + 1;
        const vision = new visionModel({text,heading, rank, delete: false});
        await vision.save();

        res.status(200).json({message : "created successfully",vision})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }
}


exports.updateVision = async (req,res,next) =>{
    const {visionId} = req.params;
  const {heading,text} = req.body;
    try {

        if(!visionId){
            return res.status(400).json({message : "Id Required"})
        }
        const vision = await visionModel.findById(visionId);
        if(!vision){
            return res.status(400).json({message : "Item not Found,after updation"})
        }
        if(vision.delete){
            return res.status(400).json({message : "Item is already deleted"})
        }

        await visionModel.findByIdAndUpdate(visionId,{text,heading},{new:true});

       
        res.status(200).json({message:"Upated successfully!" , vision})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }

}



exports.deleteVision = async (req,res,next) =>{
    const {visionId} = req.params;
    
    try {

        if(!visionId){
            return res.status(400).json({message : "Id Required"})
        }
        
        const vision = await visionModel.findById(visionId);
        if(!vision){
            return res.status(400).json({message : "Item not Found"})
        }

        if(vision.delete){
            return res.status(400).json({message : "Item is already deleted"})
        }

        vision.delete = true;
        await vision.save();
        res.status(200).json({message:"Deleted successfully!" , vision})
    } catch (error) {
        next(createError(500, "Error creating order"));
    }

}