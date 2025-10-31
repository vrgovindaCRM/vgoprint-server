const express = require("express");
const  orderRouter = express.Router();
const orderController = require("../controllers/orderController")
const { auth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

    orderRouter.post("/orders", auth,upload.fields([{ name: 'frontImage', maxCount: 1 },{ name: 'backImage', maxCount: 1 },{ name: 'backCoverImage', maxCount: 1 },{ name: 'frontCoverImage', maxCount: 1 },{ name: "attachFile", maxCount: 1 },]),orderController.createOrder);
 orderRouter.get("/orders/:orderId", auth ,orderController.getOrderById);
 orderRouter.get("/orders",  auth,orderController.getOrders);
 orderRouter.get('/ordersByAdmin',auth,orderController.getAllOrdersByAdmin)
 orderRouter.get("/getCurrentMonthOrderCounts",orderController.getCurrentMonthOrderCounts)
 orderRouter.post('/repeat-order/:orderId', auth, orderController.repeatOrder);
 orderRouter.put("/orders/:orderId", auth, orderController.updateOrder);
 orderRouter.delete("/orders/:orderId", auth, orderController.deleteOrder);
 orderRouter.patch('/update-payment-image/:orderId', auth, upload.single('paymentImage'), orderController.updatePaymentImage);
 orderRouter.patch('/change-product-order-image/:orderId', auth, upload.single('productOrderImage'), orderController.updateProductOrderImage);
 orderRouter.patch('/order/:orderId/status',auth,orderController.changeOrderStatus)
 orderRouter.patch('/order/:orderId/message',auth,orderController.updateOrderMessage)
 orderRouter.patch('/order/:orderId/payment-verification',auth, upload.none(), orderController.changePaymentVerification); 
 orderRouter.patch('/update-back-cover-image/:orderId',auth,upload.single('backCoverImage'),orderController.updateBackCover)
 orderRouter.patch('/update-front-cover-image/:orderId',auth,upload.single('frontCoverImage'),orderController.updateFrontCover)
 orderRouter.get('/get-dispatch-order',auth,orderController.getDispatchJobs);
 orderRouter.get('/get-production-order',auth,orderController.getJobsInProduction);
 orderRouter.get('/get-unBilled-order',auth,orderController.getUnbilledJob);
 orderRouter.get('/get-delivered-order',auth,orderController.getDeliveredJob);
 orderRouter.get('/get-binding-order',auth,orderController.getBindingJob);
 orderRouter.get('/get-cancelled-order',auth,orderController.getCancelledJob);
 orderRouter.get('/get-design-order',auth,orderController.getDesignJob);
 orderRouter.get('/get-complete-order',auth,orderController.getCompleteJobs);
 orderRouter.patch('/addImages/:orderId', auth,upload.fields([{ name: 'frontImage', maxCount: 1 },{ name: 'backImage', maxCount: 1 },{ name: 'backCoverImage', maxCount: 1 },{ name: 'frontCoverImage', maxCount: 1 }]),orderController.updateOrderImage);

module.exports =  {orderRouter};
