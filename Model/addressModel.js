const mongoose = require('mongoose')
const User = require('../Model/userModel');

const addressSchema = new mongoose.Schema({
    HouseName:{
        type:String,
        required:true
    },
    Street:{
        type:String,
        required:true
    },
    City:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pinCode:{
        type:String,
        required:true
    }
})

const UserAddress = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    address:[addressSchema]
})

module.exports = mongoose.model('Address',UserAddress);
