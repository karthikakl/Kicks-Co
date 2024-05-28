const express = require('express');
const user_route = express();
const userController=require('../Controller/userController');
const couponController = require('../Controller/couponController');
const orderController = require('../Controller/orderController');
const {isUser,isLoggeduser} = require('../Middleware/userauth');
const session = require('express-session');

const config = require("../config/config");

user_route.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: true}));

user_route.set('views','./views/user');


user_route.get('/',isUser,userController.homePage);
user_route.get('/login',isLoggeduser,userController.userLogin)
user_route.post('/home',isLoggeduser,userController.verifyLogin)
user_route.get('/signup',isLoggeduser,userController.userSignup);
user_route.post('/signup',isLoggeduser,userController.insertUser);
user_route.post('/verify',isLoggeduser,userController.verifyMail);
user_route.post('/insertUser',isLoggeduser,userController.insertUser)
user_route.get('/logout',isUser,userController.userLogout)
user_route.get('/productDetails',userController.productDetails);
user_route.get('/resendOtp/:email',isLoggeduser,userController.resendOtp);
user_route.post('/editUser',isUser,userController.editUser);
user_route.post('/changePassword',isUser,userController.changePassword);
user_route.get('/forgotPassword',isLoggeduser,userController.forgotPassword);
user_route.post('/resetPassword',isLoggeduser,userController.resetPassword);
user_route.get('/newpass',isLoggeduser,userController.resetPage);
user_route.post('/newpass',isLoggeduser,userController.newPass);
user_route.get('/filterPage',isUser,userController.sortingPage);
user_route.get('/wishlist',isUser,userController.productWhislist);
user_route.post('/addtoWhishlist/:id',isUser,userController.addtoWishlist);
user_route.delete('/reomveWislistProduct/:id',isLoggeduser,userController.removeWishlistProduct);

//coupon management

user_route.post('/applyCoupon',isUser,couponController.applyCoupon);
user_route.post('/removeCoupon',isUser,couponController.removeCoupon);

//return management

user_route.post('/returnProduct',isUser,orderController.returnProduct);

user_route.get('/orderView/:id',isUser,userController.orderDetails);

module.exports=user_route;