const { sizeModel } = require('../models/size.model');

exports.getSizes = async (req, res) => {
  try {
    const sizes = await sizeModel.find({ delete: false });

    res.status(200).json({ sizes });
  } catch (error) {
    console.error('Error getting sizes:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};

exports.getSizeById = async (req, res) => {
  try {
    const { sizeId } = req.params;

    const size = await sizeModel.findById(sizeId);

    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    if(size.delete){
      return res.status(403).json({message : "Size already deleted"});
    }

    res.status(200).json({ size });
  } catch (error) {
    console.error('Error getting size:', error);
    res.status(500).json({ message: 'Internal Server error' });
  }
};


