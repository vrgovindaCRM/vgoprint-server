const termsModel = require("../models/terms.model");


exports.getTerms = async (req, res) => {
    try {
        const terms = await termsModel.find({delete: false}).sort({ rank: 1 }); 
        res.status(200).json({message : "data successfully uploaded",terms});
    } catch (error) {
        console.error("Error fetching terms:", error);
        res.status(500).json({ message: "server error" });
    }
};