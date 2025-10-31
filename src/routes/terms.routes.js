

const express = require('express');
const termsRouter = express.Router();
const termsController = require('../controllers/termController');

termsRouter.get('/getTerms', termsController.getTerms);

module.exports = termsRouter;