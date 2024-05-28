const mongoose = require('mongoose') 


const categoerySchema =new mongoose.Schema({

    name:{
        type:String,
        required: true,
    },
    isList:{
        type: Boolean,
        default:true,
    },

    description: {
        type:String,
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Offers',
    },
    createdOn :{
        type:Date,
        default:Date.now,

    }

})
module.exports = mongoose.model('Category',categoerySchema)