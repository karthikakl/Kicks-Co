const mongoose = require ("mongoose")


const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 , // The document will be automatically deleted after 60 second of its creation time
      },
})
module.exports=mongoose.model('otp',otpSchema);