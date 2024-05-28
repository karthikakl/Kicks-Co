const nodemailer = require('nodemailer')

const sendVerifyMail = async (email,otp,resetLink) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
                // authMethod:'PLAIN'
            }
        });

        let htmlContent = '';
        if (resetLink) {
            htmlContent = `
                <p>Hi user,<br> your otp is: ${otp}. Click <a href="${resetLink}">here</a> to reset your password.</p>
            `;
        } else {
            htmlContent = `
                <p>Hi user,<br> your otp is: ${otp}.</p>
            `;
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'For Verification mail',
            html: htmlContent
        }
        //sending mail
        
        const info = await transporter.sendMail(mailOptions);
        console.log("Email has been sent:- ", info.response);
    } catch (error) {
        console.log(error.message)
    }

    // 
}
module.exports=sendVerifyMail