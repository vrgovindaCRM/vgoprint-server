const InfoModel = require("../models/homePage.model")

exports.getHomePageDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        
        const skip = (page - 1) * limit;
        
        const detailsQuery = InfoModel.find({delete: false}).skip(skip).limit(limit).sort({rank: 1});
        const detail = await detailsQuery.exec();
        
        const totalCount = await InfoModel.countDocuments({delete: false});
        
        res.json({ detail, totalCount, page, limit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAllList = async (req,res) =>{
    try {
        const details = await InfoModel.find({delete: false}).sort({rank: 1});
        res.status(200).json({details})
    } catch (error) {
        res.status(400).json({error})
    }
}

exports.postHomePageDetails = async(req,res) => {
     const {heading,content} = req.body;
     
    try {
        if(!heading || !content){
            return res.status(400).json({message : "Heading and Content are Required"})
        }
        const rank = await InfoModel.countDocuments({}) + 1;
        const detail = new InfoModel({heading,content,rank,delete: false});
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

        await InfoModel.findByIdAndDelete({_id:detailId});

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