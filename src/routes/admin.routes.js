const upload = require('../middlewares/multer');
const adminController = require('../controllers/adminController')

const {auth} = require('../middlewares/authMiddleware');
const adminRouter = require('express').Router();

adminRouter.post('/login',adminController.adminLogin)
adminRouter.post('/forget-password',adminController.forgetPassword)
adminRouter.post('/create-admin',adminController.createAdmin);
adminRouter.get('/Getallusers',auth,adminController.getUsers);
adminRouter.get("/reset-password", (req, res) => {
    const resetToken = req.query.token;
    if (!resetToken) {
      return res.status(400).send("Invalid request");
    }
    res.render("reset-password", { resetToken });
  });
  adminRouter.post("/reset-password", adminController.resetPassword)
  adminRouter.delete('/user/:userId',auth,adminController.deleteUser);


//  ********************** Create user by Admin ***************
adminRouter.post('/create-user-by-admin',auth,adminController.createUser)
adminRouter.patch('/update-Balance/:userId' ,auth, adminController.updateBalance);
adminRouter.get('/get-all-values-to-add-product/:productNameId',auth,adminController.getAllValuesToAddProduct)


// ********************* create Product ********************

adminRouter.post('/add-product',auth,upload.none(),adminController.createProduct)
adminRouter.get('/get-products',auth,adminController.getProducts)

// ********************** create size ********************

adminRouter.post("/Addsizes",auth,upload.none(), adminController.createSize);
adminRouter.put("/sizes/:sizeId",auth, adminController.updateSize)
adminRouter.delete("/sizes/:sizeId",auth, adminController.deleteSize);

// *********************** terms and conditions ********************

adminRouter.get('/get-terms',auth,adminController.getTerms)
adminRouter.post('/add-terms',auth,adminController.addTerms)
adminRouter.delete('/delete-terms/:termsId',auth,adminController.deleteTerms);
adminRouter.post('/update-ranks',auth,adminController.updateRanks)
adminRouter.patch('/update-terms/:termsId',auth,adminController.updateTerms);
adminRouter.post('/update-ranks-vission-mission-policy',auth,adminController.updateRanksVissionMissionPolicy)
adminRouter.post('/update-ranks-payment-policy',auth,adminController.updateRanksPaymentPolicy)
adminRouter.post('/update-ranks-own-details',auth,adminController.updateRanksOwnDetails)
adminRouter.post('/update-ranks-home-page-details',auth,adminController.updateRanksHomePageDetails)
adminRouter.post('/update-ranks-about',auth,adminController.updateRanksAbout)
adminRouter.post('/update-ranks-productName',auth,adminController.updateRanksProductName)
adminRouter.post('/update-ranks-size',auth,adminController.updateRanksSize)
adminRouter.post('/update-ranks-paperQuality',auth,adminController.updateRanksPaperQuality)
adminRouter.post('/update-ranks-coverPaperQuality',auth,adminController.updateRanksCoverPaperQuality)
adminRouter.post('/update-ranks-quantity',auth,adminController.updateRanksQuantity)

// ************************************ delete apis *************************
adminRouter.post("/delete-products",auth,adminController.DeleteMarkedProducts)
adminRouter.post("/delete-orders",auth,adminController.DeleteMarkedOrders)
adminRouter.post("/delete-users",auth,adminController.DeleteMarkedUsers)
adminRouter.post("/delete-productsAcc",auth,adminController.DeleteMarkedProductsAcc)

adminRouter.get("/get-products/:productNameId",auth,adminController.getProductscrm)
adminRouter.get('/get-user-balance/:userId',auth,adminController.getUserBalance)
adminRouter.get('/get-products-user',auth,adminController.getProductsUserByAdmin)
adminRouter.patch('/add-message/:orderId',auth,adminController.updateOrderMessage)
adminRouter.get('/get-admin',auth,adminController.getAdmin)
adminRouter.patch('/update-admin',auth,adminController.updateAdmin)
adminRouter.delete('/delete-admin/:adminId',auth,adminController.deleteAdmin)
adminRouter.patch('/update-status/:orderId',auth,adminController.updateOrderStatus)
adminRouter.patch('/update-product/:productId',auth,adminController.updateProduct)
adminRouter.patch('/update-status-cancel/:orderId',auth,adminController.updateCancelOrder)
adminRouter.get("/get-All-values", auth , adminController.getAllValues)
adminRouter.patch('/update-value/:id',auth, upload.single("image") ,adminController.updateValue)
adminRouter.delete('/delete-value/:id', upload.none() ,adminController.deleteProductAccessories)
adminRouter.patch("/update-user-profile/:id",auth , adminController.updateUserProfile);
adminRouter.patch("/Verifyuser/:id",auth,adminController.verifyUser);

// ******************** create product name ********************
adminRouter.post('/add-productName',auth,upload.single('productImage'),adminController.addProductName)
adminRouter.get('/get-productName',auth,adminController.getAllProductName);
adminRouter.delete('/delete-productName/:productNameId',auth,adminController.deleteProductName);
adminRouter.patch('/update-productName/:productNameId',auth,adminController.updateProductName);

 // *********************** Home Page Printing details ****************

adminRouter.get('/get-details',auth,adminController.getHomePageDetails);
adminRouter.post('/add-home-page-details',auth,adminController.postHomePageDetails);
adminRouter.delete('/home-page-details-delete/:detailId',auth,adminController.deleteHomePageDetails);
adminRouter.patch('/home-page-details-update/:detailId',auth,adminController.updateHomePageDetails);


// ********************* address routes **********************

adminRouter.get('/getAddress',auth,adminController.getFooterAddress);
adminRouter.post('/add-new-Address',auth,adminController.postFooterAddress);
adminRouter.delete('/deleteAddress/:addressId',auth,adminController.deleteFooterAddress);
adminRouter.patch('/updateAddress/:addressId',auth,adminController.updateFooterAddress);
adminRouter.get('/states-code-city',auth,adminController.getStates)

// ************************** product Quantity routes ****************

  adminRouter.get('/get-all-quantity' , auth, adminController.getAllQuantity);
  adminRouter.post('/add-new-quantity' , auth, upload.none(), adminController.addNewQuantity);
  adminRouter.delete('/delete-quantity/:quantityId',auth, adminController.DeleteQuantity)

// ************************* paper Quality ********************

  adminRouter.get('/get-all-paperQuality' , auth, adminController.getAllPaperQuality);
  adminRouter.post('/add-new-paperQuality' , auth,upload.none(), adminController.addNewPaperQuality);
  adminRouter.delete('/delete-paperQuality/:qualityId',auth, adminController.DeletePaperQuality)


  // *************************book and wallcalendar cover paper Quality ********************

  adminRouter.get('/get-all-coverPaperQuality' , auth, adminController.getAllCoverPaperQuality);
  adminRouter.post('/add-new-coverPaperQuality' , auth,upload.none(), adminController.addNewCoverPaperQuality);
  adminRouter.delete('/delete-coverPaperQuality/:qualityId',auth, adminController.DeleteCoverPaperQuality)

  // ******************************* Create Order by the admin for the customer **********************


  adminRouter.post('/create-order-by-admin', auth ,upload.fields([{ name: 'frontImage', maxCount: 1 },{ name: 'backImage', maxCount: 1 },{ name: 'backCoverImage', maxCount: 1 },{ name: 'frontCoverImage', maxCount: 1 }]) , adminController.CreateOrderByAdmin);
  adminRouter.patch('/update-order/:id', auth, upload.fields([{ name: 'frontImage', maxCount: 1 },{ name: 'backImage', maxCount: 1 },{ name: 'backCoverImage', maxCount: 1 },{ name: 'frontCoverImage', maxCount: 1 }]) , adminController.UpdateOrderByAdmin);
  adminRouter.get('/getAllOrderByAdmin' , auth, adminController.GetAllOrder)
  adminRouter.patch('/order/:orderId/field', auth , adminController.updateOrderField)
  adminRouter.get('/numberOfAdminAndCust', auth , adminController.numberOfAdminAndCust)

  module.exports = {adminRouter}




  