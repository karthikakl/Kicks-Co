const express = require('express');
const cart_route = express();
const cartController = require('../Controller/cartController')
const {isUser,isLoggeduser} = require('../Middleware/userauth');

// const sessionSecret = 'your-secret-key'

// cart_route.use(session({
//     secret:sessionSecret,
//     resave: false,
//     saveUninitialized: true}));

 cart_route.set('views','./views/user');



cart_route.post('/addcart',isUser,cartController.addToCart)
cart_route.get('/cart',isUser,cartController.viewCart)
cart_route.delete('/cart/delete/:productId/:size',isUser,cartController.deleteItem)
cart_route.put('/cart/:Action/:productId/:size',isUser,cartController.updateQuantity)
cart_route.get('/cart/total',isUser,cartController.getTotal);
cart_route.get('/productCount',cartController.productCount);

module.exports = cart_route;
