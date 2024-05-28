const express = require('express')
const address_route=express()
const addressController= require('../Controller/addressController');
const session = require('express-session');
const {isUser,isLoggeduser, guestUser } = require('../Middleware/userauth')

address_route.set('views','./views/user')

address_route.get('/account',isUser,addressController.userAccount)
address_route.get('/addAddress',isUser,addressController.addpage)
address_route.post('/addAddress',isUser,addressController.addAddress)
address_route.get('/editAddress/:id',isUser,addressController.editPage)
address_route.post('/editaddress/:id',isUser,addressController.editAddress)
address_route.get('/deleteAddress/:id',isUser,addressController.deleteAddress)

module.exports=address_route;