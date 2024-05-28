const express = require('express')
const product_route = express();
const productController = require('../Controller/productController')
const  {upload,deleteImage} = require('../config/multer') 
const {isUser,isLoggeduser} = require('../Middleware/userauth');
const {isAdmin,isLoggedAdmin} = require('../Middleware/adminAuth');


product_route.set('views','./views/admin');
 

product_route.get('/products',isLoggedAdmin,productController.products)
product_route.get('/products/addproduct',isLoggedAdmin,productController.addPage)
product_route.post('/products/addproduct',isLoggedAdmin,upload.array('images[]',6),productController.addProduct)
product_route.get('/products/editproduct',isLoggedAdmin,productController.editProduct)
product_route.post('/products/editproduct',isLoggedAdmin,upload.array('images[]',6),productController.updateProduct)
product_route.put('/products/unpublish/:id',isLoggedAdmin,productController.unPublish)
product_route.put('/products/ispublish/:id',isLoggedAdmin,productController.isPublish)
product_route.get('/products/deleteProduct/:id',isLoggedAdmin,productController.deleteProduct)
product_route.get('/products/viewproduct/:id',isLoggedAdmin,productController.viewProduct);
product_route.delete('/deleteimage',isLoggedAdmin,productController.deletedImages);

// product_route.get('/products/addWishlist/:id',productController.addWishlist)


module.exports = product_route;