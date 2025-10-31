const express = require("express");
const ownDetailsRouter = express.Router();
const ownDetailsController = require("../controllers/ownDetailsController");
const { auth } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");



ownDetailsRouter.get('/get-ownDetails',ownDetailsController.getOwnDetails);
ownDetailsRouter.post('/create-ownDetails',auth,upload.single('ownDetailImage'),ownDetailsController.createOwnDetails);
ownDetailsRouter.patch('/update-ownDetails/:ownDetailsId',auth,upload.single('ownDetailImage'),ownDetailsController.updateOwnDetails);
ownDetailsRouter.delete('/delete-ownDetails/:ownDetailsId',auth,ownDetailsController.deleteOwnDetails);



module.exports = {ownDetailsRouter}