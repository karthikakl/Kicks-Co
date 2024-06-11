const otp = require('otp-generator');
const Otp = require("../Model/otpModel")

const generateOtp =async(email)=>{
    try{
        const otpValue = otp.generate(4,{ lowerCaseAlphabets:false,upperCaseAlphabets: false, specialChars: false});
        const otpData= new Otp({
            email:email,
            otp:parseInt(otpValue)
        })
        await otpData.save()
    }catch(error){
        console.error('saving OTP',error.message);
    }

}

module.exports = generateOtp;