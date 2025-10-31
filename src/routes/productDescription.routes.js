const express = require('express');
const Descriptionrouter = express.Router();
const { auth } = require('../middlewares/authMiddleware');
const productDescriptionController = require ('../controllers/productDescriptionController');
const upload = require('../middlewares/multer');


Descriptionrouter.post('/create-description', upload.array('productDescriptionImage'),auth, productDescriptionController.createDescription);

Descriptionrouter.get('/get-description/:nameSize', auth , productDescriptionController.getDescription  );

Descriptionrouter.get('/get-description-byId/:id', auth , productDescriptionController.getDescriptionById);

Descriptionrouter.put('/updateDescription/:id', upload.array('productDescriptionImage'), auth , productDescriptionController.updateProductDescription);

Descriptionrouter.delete('/deleteDescription/:id', auth , productDescriptionController.deleteProductDescription);

module.exports = {Descriptionrouter};
