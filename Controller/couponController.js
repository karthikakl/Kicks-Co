const Coupon = require('../Model/couponModel');
const Category = require('../Model/categoryModel');
const Product = require('../Model/productModel');
const orderModel = require('../Model/orderModel');
const Cart = require('../Model/cartModel');
const User = require('../Model/userModel');

const couponList = async(req,res)=>{
    try {
        const coupons = await Coupon.find()
        res.render('couponList',{coupons});
    } catch (error) {
        console.error('coupon page displaying error');
    }
}

const addCodePage = async(req,res)=>{
    try {
        const products = await Product.find();
        const categories = await Category.find();
        res.render('createCoupon',{products,categories});
    } catch (error) {
        console.error('coupon page displaying error',error);
    }
}

const addCoupon = async(req,res)=>{
    try {
        const {
            coupon,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscount,
            expirationDate,
            description
        } = req.body;

           
            if(!coupon || coupon.trim() ===''){
                return res.status(400).json({success:false,message:'code should be added'})
            }
            const existingCoupon = await Coupon.findOne({ coupon: coupon });
        if (existingCoupon) {
            const codeError = 'Coupon code already exists';
            return res.render('createCoupon', { message: codeError });
        }


            const newCoupon = new Coupon({
                coupon,
                discountType,
                discountValue,
                minPurchaseAmount,
                maxDiscount,
                expirationDate,
                description
            });

            console.log('newCoupon====',newCoupon);

            await newCoupon.save();
           return res.redirect('/admin/couponList');

     } catch (error) {
        console.error('coupon code not added',error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
}

const deleteCoupon = async(req,res)=>{
    try {
        const couponId = req.params.id;
        await Coupon.findByIdAndDelete(couponId)
        res.redirect('/admin/couponList');
    } catch (error) {
        console.error(error);
    }
}

const applyCoupon = async (req, res) => {
    try {
        const { coupon, total } = req.body;
       
        const userId = req.session.user_id;

        const trimmedCoupon = coupon.trim().toUpperCase();
       const couponCode = await Coupon.findOne({coupon: trimmedCoupon});

       const usedCoupon = couponCode.users.some(data => data.toString() === userId);

        if(usedCoupon){
            return res.status(400).json({ success: false, message: "Coupon already used" });
        }
        if (!couponCode) {
            return res.status(400).json({ success: false, message: "Coupon is not valid" });
        }

        if (new Date() > couponCode.expirationDate) {
            return res.status(200).json({ success: false, message: "Coupon has expired", errorCode: "couponExpired" });
        }
        
        if (total < couponCode.minPurchaseAmount) {
            return res.status(200).json({ success: false, message: "Total amount does not meet the minimum purchase requirement for this coupon", errorCode: "minPurchaseAmount" });
        }

        if (couponCode.maxDiscount > total) {
            return res.status(200).json({ success: false, message: "Total amount exceeds the maximum discount limit for this coupon", errorCode: "maxDiscount" });
        }

        let discountedTotal = total;

        if (couponCode.discountType === 'fixed_amount') {
            discountedTotal -= couponCode.discountValue;
        } else if (couponCode.discountType === 'percentage') {
            discountedTotal = total - (total * (couponCode.discountValue / 100));
        }
        

        await User.findByIdAndUpdate({ _id: userId }, { appliedCoupon: couponCode._id });

        return res.status(200).json({ success: true, discountedTotal });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const removeCoupon = async(req,res)=>{
    try {
        
        const userId = req.session.user_id;
        await User.findByIdAndUpdate({_id:userId},{
            appliedCoupon:null});
             
            return res.status(200).json({success:true});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' }); 
    }
}
module.exports={
    couponList,
    addCodePage,
    addCoupon,
    deleteCoupon ,
    applyCoupon ,
    removeCoupon
}