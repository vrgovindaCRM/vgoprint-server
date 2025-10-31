const express = require("express");

const sizeController = require('../controllers/sizeController')
const { auth } = require('../middlewares/authMiddleware');

const sizeRouter = express.Router();



sizeRouter.get("/Getsizes",auth,sizeController.getSizes);

sizeRouter.get("/sizes/:sizeId",auth, sizeController.getSizeById);

module.exports = {sizeRouter};
