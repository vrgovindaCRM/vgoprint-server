const { enquiryModel } = require("../models/enquiry.model");

exports.createEnquiry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobName, product, quantity, rate, remark } = req.body;

    if (!jobName || !product || !quantity || !remark) {
      return res.status(400).json({
        success: false,
        message: "Job Name, Product, Quantity, and Remark are required."
      });
    }

    const newEnquiry = new enquiryModel({
      userId,
      jobName,
      product,
      quantity,
      rate : rate || 0 ,
      remark
    });

    const savedEnquiry = await newEnquiry.save();

    res.status(201).json({
      success: true,
      data: savedEnquiry,
      message: "Printing enquiry created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEnquiry = async (req, res) => {
  try {
    const enquiries = await enquiryModel
      .find({ isDeleted: false })
      .populate("userId"); 

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEnquiryUserId = async (req, res) => {
  try {
     const userId = req.user.userId;
    const enquiries = await enquiryModel
      .find({ isDeleted: false , userId })

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEnquiryId = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Printing enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const { jobName, product, quantity, rate, remark, isCompleted } = req.body;

    const enquiry = await enquiryModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Printing enquiry not found"
      });
    }

    if (jobName) enquiry.jobName = jobName;
    if (product) enquiry.product = product;
    if (quantity !== undefined) enquiry.quantity = quantity;
    if (rate !== undefined) enquiry.rate = rate;
    if (remark !== undefined) enquiry.remark = remark;
    if (isCompleted !== undefined) enquiry.isCompleted = isCompleted;

    const updatedEnquiry = await enquiry.save();

    res.status(200).json({
      success: true,
      data: updatedEnquiry,
      message: "Printing enquiry updated successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleCompleteStatus = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isCompleted: true },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Printing enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
      message: "Printing enquiry marked as completed"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await enquiryModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Printing enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Printing enquiry deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
