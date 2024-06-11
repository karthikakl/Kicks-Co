const User = require('../model/userModel')

const isUser = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            if(user){
                if(!user. is_block){
                    next();
                }else{
                    req.session.destroy();
                    return res.redirect('/logout');
                }
               
            }
           
        }
        else {
            req.session.destroy();
            return res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLoggeduser = async (req, res, next) => {
    try {
        if (req.session.isLoggeduser) {
            res.redirect('/')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}
// const guestUser = async (req, res, next) => {
//     try {
//         if (req.session.user_id) {
//             const userData = await User.findOne({ _id: req.session.user_id, is_block: false })
//             if (!userData) {
//                 return res.redirect('/logout')
//             }
//             return next();
//         }
//         else {
//             return next()
//         }

//     } catch (error) {
//         console.log(error.message);
//     }
// }
module.exports = {
    isUser,
    isLoggeduser,
   
}