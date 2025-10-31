const express = require('express');
const { createEnquiry, getEnquiry, getEnquiryId, updateEnquiry, toggleCompleteStatus, deleteEnquiry, getEnquiryUserId } = require('../controllers/enquiryController');
const { auth } = require('../middlewares/authMiddleware');
const enquiryRouter = express.Router();

enquiryRouter.post('/create', auth, createEnquiry);

enquiryRouter.get('/getEnquiryUserId',auth, getEnquiryUserId );
enquiryRouter.get('/', auth,getEnquiry);

enquiryRouter.get('/:id',auth, getEnquiryId);

enquiryRouter.patch('/:id',auth, updateEnquiry);

enquiryRouter.patch('/:id/complete', auth,toggleCompleteStatus);

enquiryRouter.delete('/:id',auth, deleteEnquiry );


module.exports = enquiryRouter;