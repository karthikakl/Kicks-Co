const mongoose = require("mongoose");
const Product = require('./productModel');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    is_verified: {
        type: Number,
        default: 0
    },
    is_block:{
        type:Boolean,
        default:false
    },
    createdOn :{
        type:Date,
        default:Date.now()

    },
    whishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],
    wallet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'wallet'
    },
    appliedCoupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Coupon'
    }
    
    

})
module.exports = mongoose.model('User', userSchema);


