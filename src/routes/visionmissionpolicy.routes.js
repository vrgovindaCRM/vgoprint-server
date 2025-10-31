const express = require("express");
const visionRouter = express.Router();
const visionController = require('../controllers/visionController');
const { auth } = require("../middlewares/authMiddleware");



visionRouter.get('/get-vision',visionController.getVision);
visionRouter.post('/create-vision',auth,visionController.createVision);
visionRouter.patch('/update-vision/:visionId',auth,visionController.updateVision);
visionRouter.delete('/delete-vision/:visionId',auth,visionController.deleteVision);


module.exports = {visionRouter}