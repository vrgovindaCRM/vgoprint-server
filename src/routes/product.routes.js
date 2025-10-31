const express = require('express');
// const upload = require('../middlewares/multer');
const productController = require('../controllers/productController')
const { auth } = require('../middlewares/authMiddleware');
const validateProduct = require('../middlewares/validateProduct');
const upload = require('../middlewares/multer');

const productRoute = express.Router();

productRoute.post('/addproducts', auth, upload.single('productImage'), productController.createProduct);
productRoute.get('/getproducts',auth, productController.getProducts);
productRoute.get('/getfilterProduct',auth,productController.getFilterProduct)
productRoute.get('/products/:productId',auth, productController.getProductById);
productRoute.put('/products/:productId',auth,validateProduct, productController.updateProduct);
productRoute.delete('/products/:productId',auth, productController.deleteProduct)
productRoute.get('/getAllProductDetails',auth,productController.getAllProductDetails);
productRoute.get('/paperQuality/:productName',auth,productController.getPaperQuality);


module.exports = {productRoute}