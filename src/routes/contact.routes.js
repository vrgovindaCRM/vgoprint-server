const express = require('express');
const contactRouter = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const { createContact, getContacts, updateContact, deleteContact } = require('../controllers/contactController');


contactRouter.post('/create-contact', auth, createContact);
contactRouter.get('/get-contacts', getContacts);
contactRouter.patch('/update-contact/:id', auth, updateContact);
contactRouter.delete('/delete-contact/:id', auth, deleteContact);

module.exports = contactRouter;
