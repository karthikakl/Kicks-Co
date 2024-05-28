const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    balance:{
        type:Number,
        default:0
    },
    transaction:[{
        amount:{
            type:Number,
            required:true
        },
        reason:{
            type:String
        },
        transactionType:{
            type: String,
        enum:['debit','credit']
        },
        date:{
            type:Date,
            default:Date.now()
        }
    }]

})

module.exports = mongoose.model('wallet',walletSchema);