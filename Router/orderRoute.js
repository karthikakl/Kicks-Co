const express = require('express')
const order_route= express();
const orderController= require('../Controller/orderController');
const{isUser,isLoggeduser } = require('../Middleware/userauth'); 

order_route.set('views','./views');
// order_route.set('views','./views/admin')

order_route.get('/checkout',isUser,orderController.viewCheckout);
order_route.post('/order',isUser,orderController.placeOrder);
order_route.post('/razorPay',isUser,orderController.razorPay);
order_route.post('/orderPlacing',isUser,orderController.razorPayOrderPlacing);
order_route.post('/walletPay',isUser,orderController.walletPay)
order_route.get('/orderConfirmed',isUser,orderController.orderConfirmed);
order_route.put('/cancelTotalOrder/:id',isUser,orderController.cancelTotalOrder);
order_route.put('/cancelEachProduct/:orderId/:productId',isUser,orderController.cancelEachProduct);
order_route.get('/orderView/:id',isUser,orderController.orderView);
order_route.get('/orderInvoice/:id',isUser,orderController.orderInvoice);
order_route.get('/paymentFailure',isUser,orderController.paymentFailure);
order_route.get('/payment/:id',isUser,orderController.payment);
order_route.post('/createRazorPay/:id',isUser,orderController.createRazorPay);
order_route.post('/walletPayment/:id',isUser,orderController.walletPayment);



module.exports=order_route;