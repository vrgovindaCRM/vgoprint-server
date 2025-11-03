const express = require('express');
const { userSignUp, userLogin, verifyMail, forgetPassword, resetPassword, getUsers, userDetails, getUserById, updateUser } = require('../controllers/usersController');
const upload = require('../middlewares/multer');
const { auth } = require('../middlewares/authMiddleware');
const userRoute = express.Router();
 
userRoute.post('/signup',userSignUp); 
userRoute.get('/verify/:verificationToken',verifyMail);
userRoute.post('/login',userLogin)
userRoute.post('/forget-password',forgetPassword)
userRoute.get('/getusers',getUsers);
userRoute.get("/reset-password", (req, res) => {
    const resetToken = req.query.token;
    if (!resetToken) {
      return res.status(400).send("Invalid request");
    }
    res.render("reset-password", { resetToken });
  });
  userRoute.post("/reset-password", resetPassword);
  userRoute.get('/user-details',auth,userDetails);
  userRoute.get("/user-by-id/:id",getUserById);
  userRoute.patch("/update-user/:id",updateUser);

module.exports = {userRoute};