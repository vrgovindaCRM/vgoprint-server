const { getFooterAddress, postFooterAddress, deleteFooterAddress, updateFooterAddress, getAllList, getAllAddress } = require('../controllers/footerAddress.Controller');
const isAdmin = require('../middlewares/adminMiddleware');
const { auth } = require('../middlewares/authMiddleware');

const footerRouter = require('express').Router();


footerRouter.get('/getAddressByPage',getFooterAddress);
footerRouter.get('/get-state-and-city',getAllList);
footerRouter.get('/get-all-address',getAllAddress)
footerRouter.use(auth);

footerRouter.post('/',isAdmin ,postFooterAddress);
footerRouter.delete('/:addressId',isAdmin,deleteFooterAddress);
footerRouter.patch('/:addressId',isAdmin,updateFooterAddress);


module.exports = {footerRouter}