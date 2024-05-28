const Address = require('../Model/addressModel');
const User = require('../Model/userModel');
const Product = require('../Model/productModel');
const Order = require('../Model/orderModel')
const Cart = require('../Model/cartModel');
const Razorpay = require('razorpay');
const Return = require('../Model/returnModel');
const Wallet = require('../Model/walletModel');
const Coupon = require('../Model/couponModel');
const easyInvoice = require('easyinvoice');




var razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


const viewCheckout = async(req,res)=>{
    try {
      const user = req.session.user_id;
      const cartItems = await Cart.findOne({user:user}).populate('items.product');
      const  addresses = await Address.find({user:user})
      const coupons = await Coupon.find()
      res.render('user/checkout',{cartItems,addresses,user,coupons})
    } catch (error) {
        console.log(error);
    }
}

const placeOrder = async (req, res) => {
    try {
       
        const { address, coupon} = req.body;
        console.log('address---',req.body);
        const user = req.session.user_id;

        const userData = await User.findById(user);
        const userName = userData ? userData.name : 'Unknown';

        const cart = await Cart.findOne({user:user  }).populate('items.product');

        const addressData = await Address.findOne({ user: user });
        const orderAddress = addressData.address.find(item => item._id == address);

        const newOrderItems = cart.items.map(item => ({
            product: item.product._id,
            productName: item.product.name,
            productPicture: item.product.image[0].filename,
            size: item.size,
            quantity: item.quantity,
            price: item.product.offerPrice,
            ItemPaymentMethod: 'COD',
            ItemPaymentStatus: 'pending',
            ItemStatus: 'pending'
        }));
        let total = 0;

        req.session.paymentMethod='COD'

        for (const item of newOrderItems) {
            total += item.quantity * item.price;
             
            const product = await Product.findById(item.product);
            if (product) {
                const sizeIndex = product.sizes.findIndex(size => size.size === item.size);
                if (sizeIndex !== -1) {
                    if (product.sizes[sizeIndex].stock >= item.quantity) {
                        product.sizes[sizeIndex].stock -= item.quantity;
                        await product.save();
                    } else {
                        throw new Error(`Insufficient stock for product: ${item.productName}, size: ${item.size}`);
                    }
                } else {
                    throw new Error(`Size not found for product: ${item.productName}, size: ${item.size}`);
                }
            } else {
                throw new Error(`Product not found: ${item.product}`);
            }
        }
        if(coupon){
            const appliedCoupon = await Coupon.findOne({coupon:coupon});

             total -= appliedCoupon.discountValue;

           appliedCoupon.users.push(user);
            await appliedCoupon.save();
        }

        const newOrder = new Order({
            user,
            username: userName,
            items: newOrderItems,
            total,
            address: orderAddress,
            paymentMethod: 'COD',
            paymentStatus: 'pending',
            status: 'pending'
        });

        req.session.paymentMethod='COD'

        const order = await newOrder.save();

        const deleteCart = await Cart.deleteOne({ user: user }); 
       
        
        return res.json({success:true})
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
}   
const razorPayOrderPlacing = async (req, res) => {
    try {
        
        const { address , coupon,paymentStatus,paymentId,paymentError} = req.body;
        const user = req.session.user_id;

        const userData = await User.findById(user);
        const userName = userData ? userData.name : 'Unknown';

        const cart = await Cart.findOne({user:user  }).populate('items.product');

        const addressData = await Address.findOne({ user: user });
        const orderAddress = addressData.address.find(item => item._id == address);

        const newOrderItems = cart.items.map(item => ({
            product: item.product._id,
            productName: item.product.name,
            productPicture: item.product.image[0].filename,
            size: item.size,
            quantity: item.quantity,
            price: item.product.offerPrice,
            ItemPaymentMethod: 'razorpay',
            ItemPaymentStatus: paymentStatus ||'paid',
            ItemStatus: 'pending'
        }));
        let total = 0;
        req.session.ItemPaymentMethod='razorPay'

        for (const item of newOrderItems) {
            total += item.quantity * item.price;
            const product = await Product.findById(item.product);
            if (product) {
                const sizeIndex = product.sizes.findIndex(size => size.size === item.size);
                if (sizeIndex !== -1) {
                    if (product.sizes[sizeIndex].stock >= item.quantity) {
                        product.sizes[sizeIndex].stock -= item.quantity;
                        await product.save();
                    } else {
                        throw new Error(`Insufficient stock for product: ${item.productName}, size: ${item.size}`);
                    }
                } else {
                    throw new Error(`Size not found for product: ${item.productName}, size: ${item.size}`);
                }
            } else {
                throw new Error(`Product not found: ${item.product}`);
            }
        }

        if(coupon){
            const appliedCoupon = await Coupon.findOne({coupon:coupon});

             total -= appliedCoupon.discountValue;

           appliedCoupon.users.push(user);
            await appliedCoupon.save();
        }

        const newOrder = new Order({
            user,
            username: userName,
            items: newOrderItems,
            total,
            address: orderAddress,
            paymentMethod: 'razorpay',
            paymentStatus:paymentStatus ||'paid',
            status: 'pending'
        });
        req.session.paymentMethod='razorPay'
        const order = await newOrder.save();
        const deleteCart = await Cart.deleteOne({ user: user });
       
        return res.json({success:true})
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
}
const razorPay = async (req,res)=>{
    try {
        const user = req.session.user_id
        const userCart = await Cart.findOne(({user:user}))
        const totalAmount = userCart.total;
        const paymentData = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: 'receipt_order_123',
            payment_capture: 1
        };
        const response = await razorpay.orders.create(paymentData);
        res.json(response);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
}

const walletPay = async(req,res)=>{
    try {
        console.log(req.body);
        const { address,coupon} = req.body;
        const user = req.session.user_id;

        const wallet = await Wallet.findOne({user:user});

        const userData = await User.findById(user);
        const userName = userData ? userData.name : 'Unknown';

        const cart = await Cart.findOne({user:user  }).populate('items.product');

        const addressData = await Address.findOne({ user: user });
        const orderAddress = addressData.address.find(item => item._id == address);


        const newOrderItems = cart.items.map(item => ({
            product: item.product._id,
            productName: item.product.name,
            productPicture: item.product.image[0].filename,
            size: item.size,
            quantity: item.quantity,
            price: item.product.offerPrice,
            ItemPaymentMethod: 'wallet',
            ItemPaymentStatus: 'paid',
            ItemStatus: 'pending'
        }));
        let total = 0;
        req.session.ItemPaymentMethod='wallet'
        for (const item of newOrderItems) {
            total += item.quantity * item.price;
            const product = await Product.findById(item.product);
            if (product) {
                const sizeIndex = product.sizes.findIndex(size => size.size === item.size);
                if (sizeIndex !== -1) {
                    if (product.sizes[sizeIndex].stock >= item.quantity) {
                        product.sizes[sizeIndex].stock -= item.quantity;
                        await product.save();
                    } else {
                        throw new Error(`Insufficient stock for product: ${item.productName}, size: ${item.size}`);
                    }
                } else {
                    throw new Error(`Size not found for product: ${item.productName}, size: ${item.size}`);
                }
            } else {
                throw new Error(`Product not found: ${item.product}`);
            }
        }

        if(coupon){
            const appliedCoupon = await Coupon.findOne({coupon:coupon});

             total -= appliedCoupon.discountValue;

           appliedCoupon.users.push(user);
            await appliedCoupon.save();
        }

        if(!wallet || wallet.balance < total){
            return res.status(400).json({success:false,message:"Insufficient wllate balance"});
        }

        wallet.balance -=total;

        wallet.transaction.push({
            amount:total,
            reason:'OrderPayment',
            transactionType:'debit'
        });
        await wallet.save();

        const newOrder = new Order({
            user,
            username: userName,
            items: newOrderItems,
            total,
            address: orderAddress,
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            status: 'pending'
        });
        req.session.paymentMethod='wallet'
        const order = await newOrder.save();
        const deleteCart = await Cart.deleteOne({ user: user });
        
        return res.json({success:true})
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' }); 
    }
}
const orderConfirmed = async(req,res)=>{
    try {
        const user = req.session.user_id;
        res.render('user/orderConfirmed',{user:user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to place order' });  
    }
}

const cancelTotalOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log("User ID:", userId);
        const orderId = req.params.id;

       
        const order = await Order.findOneAndUpdate(
            { user: userId, _id: orderId },
            { $set: { status: "cancelled", "items.$[].ItemStatus": "cancelled" } },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log("Payment Method:", order.paymentMethod);

       
        if (order.paymentMethod === 'razorPay' || order.paymentMethod === 'wallet') {
            console.log("Payment method qualifies for wallet refund");

            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet) {
                return res.status(404).json({ success: false, message: "Wallet not found" });
            }

            console.log("User's Wallet:", wallet);

           
            if (typeof order.total !== 'number' || order.total <= 0) {
                return res.status(400).json({ success: false, message: "Invalid order total" });
            }

           
            wallet.balance += order.total;
            wallet.transaction.push({
                amount: order.total,
                transactionType: 'credit',
                reason: 'Cancelled product',
                date: new Date(),
            });

            await wallet.save();
            console.log("Wallet updated successfully.");
        } else {
            console.log("Payment method does not qualify for wallet refund.");
        }

       
        for (const item of order.items) {
            const productId = item.product;
            console.log('Product ID:', productId);
            const product = await Product.findById(productId);

            if (!product) {
                console.error(`Product with ID ${productId} not found`);
                continue;
            }

            const sizeIndex = product.sizes.findIndex(size => size.size === item.size);
            if (sizeIndex !== -1) {
                product.sizes[sizeIndex].stock += item.quantity;
                await product.save();
                console.log(`Updated stock for product ID ${productId}, size ${item.size}`);
            } else {
                console.error(`Size not found for product: ${item.productName}, size: ${item.size}`);
            }
        }

        return res.status(200).json({ success: true, order: order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const cancelEachProduct = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.params.orderId;
        const productId = req.params.productId;
       const order = await Order.findById(orderId);

        console.log('order full details', order);

        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" })
        }

        const product = order.items.find(item => item._id.toString() === productId)
        console.log('product details kitti', product);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const productDetails = await Product.findById(product.product);
        if(!productDetails){
            return res.status(404).json({success:false,message:'Product not found'})
        }

        const sizeIndex = productDetails.sizes.findIndex(size => size.size === product.size);
        if (sizeIndex !== -1) {
            productDetails.sizes[sizeIndex].stock += product.quantity;
            await productDetails.save();
        } else {
            console.error(`Size not found for product: ${product.productName}, size: ${product.size}`);
        }

        order.items.id(productId).set({ ItemStatus: "cancelled" })

        const refundAmount = product.price * product.quantity;
        order.total -= refundAmount;
        await order.save();

      
        if (product.ItemPaymentMethod === 'razorPay' || product.ItemPaymentMethod === 'wallet') {
            const wallet = await Wallet.findOne({ user: userId });
            console.log('User wallet:', wallet);

            if (wallet) {
                wallet.balance += refundAmount;
                wallet.transaction.push({
                    amount: refundAmount,
                    transactionType: 'credit',
                    reason: 'Cancelled product',
                    date: new Date()
                });

                await wallet.save();

                console.log('Wallet updated successfully');
            } else {
                console.error('Wallet not found for user:', userId);
            }
        }

        return res.status(200).json({ success: true, message: " Product order cancelled", product: product });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const orderView = async(req,res)=>{
    try {
        const orderId= req.params.id;
       
        const order = await Order.findById(orderId).populate('items.product')
        res.render('orderView',{order,userId:req.session.id})

    } catch (error) {
        console.log(error)
        res.status(404).render('404');
    }

}

const returnProduct = async(req,res)=>{
    try {
       
       const {returnReason,orderId,itemId} = req.body;
       console.log('this issss',req.body);

       const newReturn = new Return({
        order:orderId,
        product:itemId,
        user:req.session.user_id,
        reason: returnReason,
        status:'requested'
       })
       console.log("THIS",newReturn);
       await newReturn.save();

    
       await Order.findOneAndUpdate({_id:orderId,"items._id":itemId},{$set:{"items.$.ItemStatus":"return requested"}},{new:true});

       console.log('newReturn=====',newReturn);

      

       return res.status(200).json({success:true,message:'return requested send'});
        
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const returnList = async(req,res)=>{
    try {
        
        const returns = await Return.find().populate('user','name').populate('product','name');
        console.log("returns====",returns);
        res.render('returns',{returns:returns});
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const returnApprove = async (req, res) => {
    try {
        const returnId = req.params.returnId;
        const returnRequest = await Return.findById(returnId);
        
        returnRequest.status = 'approved';
        await returnRequest.save();

        const orderId = returnRequest.order;
        
        const productId = returnRequest.product;
        
        
        const size = returnRequest.size;

        const order = await Order.findById(orderId);
        console.log('order', order);

        await Order.findOneAndUpdate({_id:orderId,"items._id":productId},{$set:{"items.$.ItemStatus":"returned"}},{new:true});

        res.status(200).json({ success: true, message: 'Return request approved successfully' })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const returnReject = async(req,res)=>{
    try {
        const returnId = req.params.returnId;
        const returnRequest = await Return.findById(returnId);
       
        returnRequest.status = 'rejected';
        await returnRequest.save();

        const orderId = returnRequest.order;        
        const productId = returnRequest.product;        
        const size = returnRequest.size;


        const order = await Order.findById(orderId);
       

        await Order.findOneAndUpdate({_id:orderId,"items._id":productId},{$set:{"items.$.ItemStatus":"return not approved"}},{new:true});
    
        res.status(200).json({ success: true, message: 'Return request rejected' })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}

const orderInvoice = async(req,res)=>{
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('items.product');
        console.log('This is the order Id:',order); 

        const data = {
            "documentTitle": "INVOICE",
            "currency": "INR",
            "taxNotation": "vat",
            "marginTop": 25,
            "marginRight": 25,
            "marginLeft": 25,
            "marginBottom": 25,
            "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
            "sender": {
                "company": "Kicks&Co",
                "address": "Cochin,Kerala",
                "zip": "5678",
                "city": "Cochin",
                "country": "India"
            },
            "client": {
                "company": order.address.HouseName,
                "address": order.address.Street,
                "zip": order.address.pinCode,
                "city": order.address.City,
                "country": order.address.state
            },
            "invoiceNumber": order._id,
            "invoiceDate": new Date().toISOString().split('T')[0],
            "products": order.items.map(item => ({
                "quantity": item.quantity,
                "description": `${item.productName}, ${item.size} size`,
                "tax": 0,
                "price": item.price
            })),
            
            "bottomNotice": "Thank you for your purchase!"
        };

        const result = await easyInvoice.createInvoice(data);
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Disposition',`attachment; filename=invoice_${orderId}.pdf`);
        res.send(Buffer.from(result.pdf,'base64'));

    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" }); 
    }
}

const paymentFailure = async(req,res)=>{
    try {
        const user = req.session.user_id;
        res.render('user/paymentFailure',{user:user})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const payment = async(req,res)=>{
    try {
        const user= req.session.user_id;
        const orderId = req.params.id;
        const order = await Order.findById({_id:orderId}).populate('items.product')
        console.log(order); 
        res.render('user/payment',{user,order})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


const createRazorPay = async (req,res)=>{
    try {
       const orderId = req.params.id;
       console.log("orderId",req.params)

       const order = await Order.findById(orderId);
        console.log("order Details:",order)

        const totalAmount = order.total;
        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt:`receipt_order_${orderId}`,
            payment_capture: 1
        };
        const response = await razorpay.orders.create(options);

        order.paymentMethod = 'razorpay',
        order.paymentStatus = 'paid'
        await order.save();

        res.json(response);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
}

const walletPayment = async(req,res)=>{
    try {

        const orderId =req.params.id;
        console.log('in wallet:',orderId);

        const userId = req.session.user_id;
        console.log('In wallet user:',userId);

        const user = await User.findById(userId).populate('wallet');
        console.log('This is the user:',user)

        const order = await Order.findById(orderId);
        console.log('This is the order:',order);

        if(user.wallet.balance < order.total){
            return res.status(400).json({success:false,message:"Insufficient wallet balance"})
        }

        user.wallet.balance -= order.total;
        console.log('user.wallet:',user.wallet.balance);

        user.wallet.transaction.push({
            amount:order.total,
            reason:'OrderPayment',
            transactionType:'debit'
        });
        await user.wallet.save();

        console.log('user.wallet',user.wallet);
        order.paymentStatus = 'paid';
        order.paymentMethod = 'wallet';
        await order.save();

        res.json({ success: true, message: "Payment successful" });
        
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Failed to place order' });  
    }
}





module.exports={
    placeOrder,
    viewCheckout,
    cancelEachProduct,
    cancelTotalOrder,
    orderView,
    orderConfirmed,
    razorPay,
    razorPayOrderPlacing,
    returnProduct,
    returnList,
    returnApprove,
    returnReject,
    walletPay,
    orderInvoice,
    paymentFailure,
    payment,
    createRazorPay,
    walletPayment,
   
   
    
   
}