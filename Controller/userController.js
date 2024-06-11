const User = require("../Model/userModel")
const Category = require("../Model/categoryModel")
const Product = require("../Model/productModel")
const bcrypt = require('bcryptjs')
const sendVerifyMail = require('../config/mailSender');
const otpGenerator = require('../config/otp');
const otp = require('otp-generator');
const Otp = require('../Model/otpModel');
const Cart = require('../Model/cartModel');
const Wallet = require('../Model/walletModel');
const Order = require('../Model/orderModel');




const securePassword = async (password) => {

    try {
        const passwordHarsh = await bcrypt.hash(password, 10)
        return passwordHarsh;
    } catch (error) {
        console.log(error.message)
    }
}

//homePage

const homePage = async (req, res) => {
    try {
        const category = await Category.find({ isList: true }, { name: 1, _id: 0 });
        const categoryData = category.map((item) => item.name)
        ;

       let productQuery = { isPublished: true };

        const sort = req.query.sort;

        let sortCriteria;
        if (sort === 'offerPrice-low-to-high') {
           sortCriteria = {offerPrice :1};
        } else if (sort === 'offerPrice-high-to-low') {
            sortCriteria = {offerPrice : -1};
        } else {
            sortCriteria ={};
        }

       const product = await Product.find(productQuery).sort(sortCriteria);

       const newArrivals = await Product.find({category:'New Arrivals',isPublished:true}).sort(sortCriteria)
        return res.status(200).render("home", 
        { user: req.session.user_id, 
            category, 
            product, 
            newArrivals,
            query: req.query.query ,sort})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })

    }
}

const productDetails = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.query.id })
        if (!product) {
            return res.json({ success: false })
        }
        return res.render('productDetails', { product, userId: req.session.user_id })
    } catch (error) {
        console.log(error);
    }
}

const userLogin = async (req, res) => {
    try {
        return res.status(200).render("userLogin")
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server Error" })
    }
}

//signup

const userSignup = async (req, res) => {
    try {
        return res.status(200).render("userSignup")
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server error" })
    }
}

//adding new user

const insertUser = async (req, res) => {

    try {
        const { name, email, number, password } = req.body;


        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            const errorMessage = 'Email already registered';
            return res.render('userSignUp', { message: errorMessage })
        }

        const spassword = await securePassword(password);
        req.session.tempUser = { name, email, number, spassword };

        await otpGenerator(email);

        const otpData = await Otp.findOne({ email: email });

        sendVerifyMail(email, otpData.otp);

        res.render('verification', { email: email })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//verifying the user via otp

const verifyMail = async (req, res) => {
    try {
        const email = req.query.email;
        const userOtp = req.body.otp;
        console.log(email);
        const OtpData = await Otp.findOne({ email: email });
        function createWallet(){
            
        }

        if (OtpData === null) {
            res.status(400).send("Invalid")
        } else {
            if (OtpData && userOtp == OtpData.otp) {
                const { name, email, number, spassword } = req.session.tempUser
                const user = new User({
                    name, email, number,
                    password: spassword,
                    is_verified: true
                })
                const userData = await user.save();
                console.log(userData);
                const newWallet = new Wallet({
                    user: userData._id
                })
                 const a=await newWallet.save();
                 const dataUser=await User.findOne({_id:userData.id})
                 dataUser.wallet=a._id
                 await dataUser.save()
                req.session.user_id = userData._id;
                req.session.isLoggeduser = true;
                return res.redirect('/') //login
            }
        }
    } catch (error) {
        console.error('Error during verification', error);
        res.status(500).send("Internal Server Error")
    }
}

// user logging after verified

const verifyLogin = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });

        if (!userData) {
            res.render('userLogin', { message: "Login failed" })
            console.log("no data")
        }
        else {
            if (userData.is_block == true) {
                return res.status(400).render('userLogin', { message: 'blocked user' })
            }

            const passwordMatch = await bcrypt.compare(req.body.password, userData.password)
            if (!passwordMatch) {
                res.render('userLogin', { message: "Password incorrect" })
                console.log(" password not matched")
            } else {
                req.session.user_id = userData._id;
                req.session.isLoggeduser = true;
                res.status(200).redirect('/')
            }
        }
    } catch (error) {
        res.status(500).send("Invalid")
    }
}
//user logout

const userLogout = async (req, res) => {
    req.session.isLoggeduser = false;
    try {
        req.session.user_id = undefined;
        res.redirect('/');

    } catch (error) {
        console.error('Error during logout', error);
        res.status(500).send("Internal Server Error")
    }
}
const resendOtp = async (req, res) => {
    try {
        const email = req.params.email;
        await otpGenerator(email);
        const otpData = await Otp.findOne({ email: email });
        await sendVerifyMail(email, otpData.otp);
        return res.status(200).json({ success: true, message: "resend otp" })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const editUser = async(req,res)=>{
    try {
        
        const{name,email,phoneNumber}= req.body;
        const userId = req.session.user_id;

        const updatedUser = await User.findByIdAndUpdate({_id:userId},{
            $set:{
                name:name,
                email:email,
                number:phoneNumber
            }
        },{new:true});

        console.log("updatedUser",updatedUser);
        return res.status(200).redirect('/account')
        
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user_id;

        const user = await User.findById(userId)
        const passwordMatch = await bcrypt.compare(currentPassword, user.password)

        if (!passwordMatch) {
            return res.status(500).json({ success: false, message: 'password not matching' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(500).json({ success: false, message: 'new Password and confirm password not matching' })
        }

        const updatePassword = await bcrypt.hash(newPassword, 10)
        user.password = updatePassword;
        await user.save();

        res.status(200).redirect('/account')



    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const forgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).render('forgotPassword', { message: "User with this email does not exist" });
        }
        const otpValue = otp.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });



        await Otp.create({ email, otp: otpValue });

        const resetLink = `http://localhost:5000/newpass?email=${email}&otp=${otpValue}`

        await sendVerifyMail(email, otpValue, resetLink);

        return res.status(200).json({ success: true, message: 'Password reset email sent. Please check your email to proceed.' });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const resetPage = async (req, res) => {
    try {
        const { email, otp } = req.query;
        res.render('resetPassword', { email, otp })
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error")
    }
}

const newPass = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const otpData = await Otp.findOne({ email, otp });
        if (!otpData) {
            return res.status(400).json({ success: false, message: 'Invalid' })
        }

        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword;
        await user.save();

        await Otp.deleteOne({ email, otp })

        return res.redirect('/login');


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

}

const sortingPage = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const categoryName = req.query.category;
        
        console.log("categoryName",categoryName)
        
        let productQuery = { isPublished: true };
        console.log('productQuery',productQuery);

        if(categoryName){
            productQuery.category = categoryName;
        }

        const sort = req.query.sort;

        let sortCriteria ={};
        if (sort === 'offerPrice-low-to-high') {
           sortCriteria = {offerPrice :1};
        } else if (sort === 'offerPrice-high-to-low') {
            sortCriteria = {offerPrice : -1};
        } else {
            sortCriteria ={};
        }

       const products = await Product.find(productQuery).sort(sortCriteria);
       console.log('products===',products);
        return res.render('filterPage', { user: userId, 
            products,
            category: categoryName, 
            sort });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send('Internal server error');
    }
}


const productWhislist = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId).populate('whishlist')
        res.render('wishlist',{user:user});
    } catch (error) {
       console.error('error')
       res.status(500).send('Internal server error') 
    }
}

const addtoWishlist = async(req,res)=>{
    try {
        const userId= req.session.user_id;
        const productId = req.params.id;
        const user = await User.findById(userId);
        
        if(user.whishlist.includes(productId)){
         return res.status(400).json({success:false,message:'product already in the whislist'})
        }

        user.whishlist.push(productId);
        await user.save();
        return res.status(200).json({success:true,message:'product added to whishlist'})
    } catch (error) {
        console.error('Error adding product to the wishlist',error);
        res.status(500).send('Internal server error in adding product to cart');
    }
}

const removeWishlistProduct = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const productId = req.params.id;

       const user = await User.findById(userId);
       const index = user.whishlist.indexOf(productId);
       user.whishlist.splice(index,1);
       await user.save();

       return res.status(200).json({success:true,message:'product has been removed from the wishlist'});
        
    } catch (error) {
        console.error('Error deleting product in the wishlist');
    }
}

const orderDetails = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        res.render('orderView',{order,userId})
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get order details' });
    }
}


module.exports = {
    homePage,
    userLogin,
    userSignup,
    insertUser,
    verifyMail,
    verifyLogin,
    userLogout,
    productDetails,
    resendOtp,
    changePassword,
    forgotPassword,
    resetPassword,
    newPass,
    resetPage,
    sortingPage,
    productWhislist,
    addtoWishlist,
    removeWishlistProduct,
    editUser,
    orderDetails
   
}

