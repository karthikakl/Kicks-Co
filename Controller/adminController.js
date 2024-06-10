const User = require("../Model/userModel");
const Order = require("../Model/orderModel");
const Product = require('../Model/productModel');
const Category = require('../Model/categoryModel')

//login

const adminLogin = async (req, res) => {
    try {
        console.log('page is loding..');
        return res.status(200).render('adminLogin')
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// verifying logging in

const adminVerify = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (process.env.ADMIN_EMAIL !== email || process.env.ADMIN_PASSWORD !== password) {
            req.session.message = {
                type: 'danger',
                message: 'Entered email or password is incorrect'
            };
            return res.redirect('/admin/login')
        } else {
            req.session.admin_id = req.body.email;
            req.session.isLoggedAdmin = true;
            console.log('admin logged in:', email);
            return res.redirect('/admin/adminHome');
        }
    } catch (error) {
        req.session.message = {
            type: 'danger',
            message: 'Error occured'
        }
        res.redirect('/login');
    }
}

//To display home page

const adminHome = async (req, res) => {
    try {
        const user = await User.find()

        const orders= await Order.find().sort({_id:-1}).populate('user');
        const order= await Order.countDocuments();
        const products= await Product.countDocuments();
        const categories = await Category.find();
        const category = await Category.countDocuments();

        const totalRevenueResult = await Order.aggregate([
            {
                $group:{
                    _id:null,
                    total:{$sum:"$total"}
                }
            }
        ]);
        const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].total : 0;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const monthlyEarningsResult = await Order.aggregate([
            {
                $match:{
                    date:{
                       $gte:new Date(`${currentYear}-${currentMonth}-01`),
                       $lt:new Date(`${currentYear}-${currentMonth + 1}-01`) 
                    }
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:"$total"}
                }
            }
        ]);

        const monthlyEarnings = monthlyEarningsResult[0] ? monthlyEarningsResult[0].total : 0;

        return res.render('adminDashboard',{
            user,
            orders,
            order,
            products,
            category,
            totalRevenue,
            monthlyEarnings
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// for logout

const adminLogout = async (req, res) => {

    try {
        req.session.isLoggedAdmin = false;
        req.session.admin_id = undefined;

        res.redirect('/admin/login');
    } catch (error) {
        return res.status(500).json({ success: false, mesage: "Internal server error" })
    }
}

// users details page

const users = async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', { users })

    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }

}

//blocking the user

const blockUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await User.findByIdAndUpdate(userId, { is_block: true })
        res.status(200).json({ success: true, message: "user Blocked" });
    } catch (error) {
        req.session.mesage = {
            type: 'failed',
            message: 'Error blocking user'
        }
    }
}

//unblocking the user

const unblockUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await User.findByIdAndUpdate(userId, { is_block: false })
        res.status(200).json({ success: true, message: "user Unblocked" });
    } catch (error) {
        req.session.mesage = {
            type: 'failed',
            message: 'Error blocking user'
        }
    }
}

//to display total order list

const orderList = async (req, res) => {
    try {
        const user = await User.find()
        const order = await Order.find()
        res.render('orderList', { order, user })
    } catch (error) {
        console.log(error)
    }
}



const orderDetails = async (req, res) => {
    try {

        const orderId = req.query.id;
        console.log("order", orderId)
        const order = await Order.findById(orderId).populate('items.product');



        if (!order) {
            console.log('Error populating order items:', error);
            return res.status(404).send('Order not found');

        }
        res.render('orderDetails', { order })
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send('Internal Server Error');
    }


}

// cancel full order

const cancelfullOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log('orderid vannu', orderId);

        const order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { status: "cancelled", "items.$[].ItemStatus": "cancelled" } }, { new: true });
        console.log('status update aay', order);

        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" })
        }

        for (const item of order.items) {
            const productId = item.product;
            console.log('ithaan product id:', productId);
            const product = await Product.findById(productId);

            console.log('product kittiiii:', product);
            if (!product) {
                console.error(`product with Id ${productId} not found`);
            }
            if (product) {
                const sizeIndex = product.sizes.findIndex(size => size.size === item.size);
                if (sizeIndex !== -1) {
                    product.sizes[sizeIndex].stock += item.quantity;
                    await product.save();
                } else {
                    console.error(`Size not found for product: ${item.productName}, size: ${item.size}`);
                }
            }
        }
        return res.status(200).json({ success: true, order: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// cancel product

const cancelProduct = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const productId = req.params.productId;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" })
        }

        const product = order.items.find(item => item._id.toString() === productId)
       
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        order.items.id(productId).set({ ItemStatus: "cancelled" })
        order.total -= product.price * product.quantity;
        await order.save();


        return res.status(200).json({ success: true, message: " Product order cancelled", product: product });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const ChangeOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
       console.log('This is the order id:',orderId);

        const order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { status: "delivered", "items.$[].ItemStatus": "delivered" } }, { new: true });

        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" })
        }
console.log('order status:',order.status);
        return res.status(200).json({ success: true, order: order });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const changeProductStatus = async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const productId = req.params.productId;
        
        const order = await Order.findById(orderId);
        const productIndex = order.items.findIndex(item => item._id.toString() === productId)

        order.items[productIndex].ItemStatus = 'delivered';
        await order.save();

        return res.status(200).json({ success: true, message: "Product status changed successfully",product: productIndex });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" }) 
    }
}

const generateReport = async (req, res) => {
    try {
        console.log(req.body);
        const { startDate, endDate } = req.body;

        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        const orders = await Order.find({
            date: { $gte: new Date(startDate), $lte: end}
        }).populate('user');
        console.log(orders)
        const reportData = orders.map((order) => {
            return {
                orderId: order._id,
                date: order.date,
                totalPrice:order.total,
                firstName: order.user.name,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus
            };
        });
        res.status(200).json({ reportData });
    } catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
  };

  const sales = async(req,res)=>{
    try {
        const {filter}= req.query;
        console.log(req.query);
        let match = {};

       if(filter ==='daily'){
        match = {$group:{_id:{$dayOfMonth:'$date'},total:{$sum:"$total"}}}
       }else if(filter ==="monthly"){
        match = {$group:{_id:{$month:"$date"},total:{$sum:"$total"}}}
       } else if(filter === "yearly"){
        match = {$group:{_id:{$year:"$date"},total:{$sum:"$total"}}}
       }else{
         return res.status(400).json({success:true,message:"filtering not done"})
       }

       const salesData = await Order.aggregate([
        match,
        { $sort :{_id:1}}
       ]);
       console.log(salesData);
        
      return res.status(200).json(salesData);
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({ error: 'Failed to generate sales chart' }); 
    }
  }
  const paymentChart = async(req,res)=>{
    try {
        const paymentMethods = await Order.aggregate([{
            $group:{
                _id:'$paymentMethod',
                count:{$sum:1}
            }
        }])

        console.log(paymentMethods);
        return res.status(200).json(paymentMethods);
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({ error: 'Failed to generate payment chart' });  
    }
  }

  const bestSellingProduct = async(req,res)=>{
    try {

        const bestSellingProducts = await Order.aggregate([
           {$unwind:"$items"},
           {
            $group:
            {_id:"$items.product",
            totalQuantity:{
                $sum:"$items.quantity"
            }
        }
    },
    { $sort:{totalQuantity:-1} },
    {$limit:10},
    {
        $lookup:{
           from:"products",
           localField:"_id",
           foreignField:"_id",
           as:"product" 
        }
    },
    {$unwind:"$product"},
    {
        $project:{
            _id:0,
            productId:"$_id",
            productName:"$product.name",
            totalQuantity:1
        }
    }
        ])

        console.log( bestSellingProducts);
        return  res.render('bestSellingProduct',{products:bestSellingProducts})
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to find products' });  
       
    }
  }

  const bestSellingCategory = async (req, res) => {
    try {
        const bestCategories = await Order.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'categories',
                    localField: "_id",
                    foreignField: "name",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    categoryName: "$categoryDetails.name",
                    totalQuantity: 1
                }
            }
        ]);

        console.log(bestCategories);
        return res.render('bestSellingCategory', { categories: bestCategories });
    } catch (error) {
        console.error('Error fetching best-selling categories:', error);
        res.status(500).json({ error: 'Failed to find categories' });
    }
};

const bestSellingBrand = async(req,res)=>{
    try {
        const bestBrands = await Order.aggregate([
            {$unwind:"$items"},
            {
                $lookup:{
                    from:"products",
                    localField:"items.product",
                    foreignField:"_id",
                    as:"productDetails"
                }

            },
            {$unwind:"$productDetails"},
            {
                $group:{
               _id:"$productDetails.brand",
               totalQuantity:{$sum:"$items.quantity"}
            }
           },
           {$sort:{totalQuantity:-1}},
           {$limit:10}
        ])

        console.log(bestBrands)
        return res.render('bestSellingBrand',{brands:bestBrands})
    } catch (error) {
        console.error('Error fetching best-selling brand:', error);
        res.status(500).json({ error: 'Failed to find brands' });  
    }
}
module.exports = {
    adminLogin,
    adminVerify,
    adminHome,
    adminLogout,
    users,
    blockUser,
    unblockUser,
    orderList,
    orderDetails,
    cancelfullOrder,
    cancelProduct,
    ChangeOrderStatus,
    changeProductStatus,
    generateReport,
    sales,
    paymentChart,
    bestSellingProduct,
    bestSellingCategory,
    bestSellingBrand
}