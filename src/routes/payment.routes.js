

const express = require('express');
const paymentRoutes = express.Router();
const paymentController = require('../controllers/paymentController');
const upload = require('../middlewares/multer');
const { auth } = require('../middlewares/authMiddleware');


paymentRoutes.get('/get-details', auth , paymentController.getDetails);
paymentRoutes.post('/create-payment-details' , auth , upload.single('QRimage'),paymentController.createPayment);
paymentRoutes.patch('/update-payment/:paymentId', auth ,upload.single('QRimage'), paymentController.updatePayment);
paymentRoutes.delete('/delete-payment/:paymentId',auth,paymentController.deletePayment);
paymentRoutes.delete('/delete-QRImage/:paymentId',auth,paymentController.DeleteQR)

module.exports = {paymentRoutes};