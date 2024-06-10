const express = require('express')
const admin_route = express();
const adminController = require('../Controller/adminController');
const couponController = require('../Controller/couponController');
const offerController = require('../Controller/offerController');
const orderController = require('../Controller/orderController');
const {isAdmin,isLoggedAdmin} = require("../Middleware/adminAuth")

admin_route.set('views','./views/admin')

admin_route.get('/login',isAdmin,adminController.adminLogin);
admin_route.post('/adminVerify',isAdmin,adminController.adminVerify);
admin_route.get('/adminHome',isLoggedAdmin, adminController.adminHome);
admin_route.get('/adminLogout',isLoggedAdmin,adminController.adminLogout);
admin_route.get('/users',isLoggedAdmin,adminController.users);
admin_route.put('/block/:id',isLoggedAdmin,adminController.blockUser);
admin_route.put('/unblock/:id',isLoggedAdmin,adminController.unblockUser);
admin_route.get('/orderList',isLoggedAdmin,adminController.orderList);
admin_route.get('/orderDetails',isLoggedAdmin,adminController.orderDetails);
admin_route.put('/cancelfullOrder/:id',isLoggedAdmin,adminController.cancelfullOrder);
admin_route.put('/cancelProduct/:orderId/:productId',isLoggedAdmin,adminController.cancelProduct);
admin_route.put('/ChangeOrderStatus/:id',isLoggedAdmin,adminController.ChangeOrderStatus);
admin_route.put('/changeProductStatus/:orderId/:productId',isLoggedAdmin,adminController.changeProductStatus);

//coupon management

admin_route.get('/couponList',isLoggedAdmin,couponController.couponList);
admin_route.get('/addCodePage',isLoggedAdmin,couponController.addCodePage);
admin_route.post('/addCoupon',isLoggedAdmin,couponController.addCoupon);
admin_route.get('/deleteCoupon/:id',isLoggedAdmin,couponController.deleteCoupon);

//offer management

admin_route.get('/offerList',isLoggedAdmin,offerController.offerList);
admin_route.get('/addOfferPage',isLoggedAdmin,offerController.addOfferPage);
admin_route.post('/addOffer',isLoggedAdmin,offerController.addOffer);
admin_route.put('/list/:offerId', isLoggedAdmin, offerController.isList);
admin_route.put('/unlist/:offerId', isLoggedAdmin, offerController.unList);

//return management

admin_route.get('/returnList',isLoggedAdmin,orderController.returnList);
admin_route.post('/retrunApprove/:returnId',isLoggedAdmin,orderController.returnApprove);
admin_route.post('/retrunReject/:returnId',isLoggedAdmin,orderController.returnReject);

//sales
admin_route.post('/generate-report',isLoggedAdmin,adminController.generateReport);
admin_route.get('/sales',isLoggedAdmin,adminController.sales);
admin_route.get('/paymentChart',isLoggedAdmin,adminController.paymentChart);
admin_route.get('/bestSellingProduct',isLoggedAdmin,adminController.bestSellingProduct);
admin_route.get('/bestSellingCategory',isLoggedAdmin,adminController.bestSellingCategory);
admin_route.get('/bestSellingBrand',isLoggedAdmin,adminController.bestSellingBrand);

module.exports = admin_route;