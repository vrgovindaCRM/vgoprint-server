const { getHomePageDetails, postHomePageDetails, deleteHomePageDetails, updateHomePageDetails, getAllList } = require('../controllers/homePageController');
const isAdmin = require('../middlewares/adminMiddleware');
const { auth } = require('../middlewares/authMiddleware');

const homepageRouter = require('express').Router();



homepageRouter.get('/',getHomePageDetails);
homepageRouter.get('/all',getAllList)

homepageRouter.use(auth);

homepageRouter.post('/',isAdmin,postHomePageDetails);
homepageRouter.delete('/:detailId',isAdmin,deleteHomePageDetails);
homepageRouter.patch('/:detailId',isAdmin,updateHomePageDetails);


module.exports = {homepageRouter}