const footerAddressModel = require("../models/footerAddress.model");


exports.getFooterAddress = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 3;
  
      const skip = (page - 1) * limit;
  
      const addressQuery = footerAddressModel.find({delete: false}).skip(skip).limit(limit);
      const address = await addressQuery.exec();
  
      const totalCount = await footerAddressModel.countDocuments({delete: false});
  
      res.json({ address, totalCount, page, limit });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  exports.getAllList = async (req, res) => {
    try {
      const addresses = await footerAddressModel.find({delete: false});
      
      // Group cities by state
      const address = addresses.reduce((acc, address) => {
        const { state, city } = address;
        if (!acc[state]) {
          acc[state] = [];
        }
        acc[state].push(city);
        return acc;
      }, {});
      
      res.status(200).json({ address });
    } catch (error) {
      res.status(400).json({ error });
    }
  };

  exports.getAllAddress = async (req,res) =>{
        try {
            const address = await footerAddressModel.find({delete: false});
            res.status(200).json({address})
        } catch (error) {
            res.status(400).json({error})
        }
  }
  

  exports.postFooterAddress = async (req, res) => {
    try {
        const address = new footerAddressModel({...req.body,delete: false});

        await address.save();
        res.status(201).json({ message: "Added successfully!", address });
    } catch (error) {
        res.status(500).json({ error });
    }
};


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
        res.status(201).json({message : "Deleted successfully",address})

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
          return res.status(400).json({ message: "Details already deleted" });
         }

        await footerAddressModel.findByIdAndUpdate({_id:addressId},req.body);
        
        address = await footerAddressModel.findById(addressId);

        res.status(201).json({message : "updated successfully",address})

    } catch (error) {
        res.status(500).json({message:error})
    }
}