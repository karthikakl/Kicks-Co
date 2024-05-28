const express = require("express")
const category_route = express();
const categoryController = require('../Controller/categoryController'); 
const {isAdmin,isLoggedAdmin} = require('../Middleware/adminAuth');


category_route.set('views','./views/admin'); 

category_route.get('/categories',isLoggedAdmin,categoryController.categories) 
category_route.get('/categories/addCategory',isLoggedAdmin,categoryController.addCategorypage)
category_route.post('/categories/addCategory',isLoggedAdmin,categoryController.addCategory)
category_route.put('/categories/unList/:id',isLoggedAdmin,categoryController.unListCategory)
category_route.put('/categories/isList/:id',isLoggedAdmin,categoryController.isListCategory)
category_route.get('/categories/editCategory',isLoggedAdmin,categoryController.editCategoryPage)
// category_route.get('/categories/editCategory/:id',categoryController.editCategory)
category_route.post('/categories/editCategory',isLoggedAdmin,categoryController.updateCategory)
category_route.get('/categories/deletecategory/:id',isLoggedAdmin,categoryController.deleteCategory)
module.exports = category_route;