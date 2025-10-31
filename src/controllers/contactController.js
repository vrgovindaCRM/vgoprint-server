const contactModel = require("../models/contactModel");

exports.createContact = async (req, res) => {
  try {
    const { title, email, mobileNumbers, rank } = req.body;

    if (!title || !email || !mobileNumbers || !rank) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newContact = new contactModel({
      title,
      email,
      mobileNumbers,
      rank,
    });

    await newContact.save();

    res.status(201).json({
      message: 'Contact section created successfully',
      contact: newContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create contact', error });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await contactModel
      .find({ delete: false })
      .sort({ rank: 1 });

    res.status(200).json({
      message: 'Contacts fetched successfully',
      contacts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch contacts', error });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedContact = await contactModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      message: 'Contact updated successfully',
      contact: updatedContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update contact', error });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await contactModel.findByIdAndUpdate(
      id,
      { delete: true },
      { new: true }
    );

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete contact', error });
  }
};
