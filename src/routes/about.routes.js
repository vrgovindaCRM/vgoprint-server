const express = require("express");
const aboutRouter = express.Router();
const aboutController = require('../controllers/aboutController');
const { auth } = require("../middlewares/authMiddleware");


aboutRouter.get('/get-about',aboutController.getAbout);
aboutRouter.post('/create-about',auth ,aboutController.createAbout);
aboutRouter.patch('/update-about/:aboutId',auth,aboutController.updateAbout);
aboutRouter.delete('/delete-about/:aboutId',auth,aboutController.deleteAbout);

module.exports = {aboutRouter}