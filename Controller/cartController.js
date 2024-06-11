const Cart = require('../model/cartModel')
const User = require('../model/userModel')
const Product = require('../model/productModel');
// const { userLogout } = require('./userController');



const addToCart = async (req, res) => {
    try {
        const { selectedQty, selectedSize, productId } = req.body;
        const quantity = parseInt(selectedQty)
        const size = parseInt(selectedSize)
        const user = req.session.user_id;

        const productData = await Product.findOne({id:productId});

        // if (productData && productData.sizes) {
        //     const selectedSizeObj = productData.sizes.find(sizeObj => sizeObj.size === size);
        //     if (!selectedSizeObj || selectedSizeObj.stock <= 0) {
        //         return res.status(400).json({ success: false, message: "Selected size is out of stock." });
        //     }
        // } else {
        //     return res.status(400).json({ success: false, message: "Product or size not found." });
        // }


        let cart = await Cart.findOne({ user: user });
        if (!cart) {
            const productData = await Product.findOne({ _id: productId })
            const items = [{ product: productData._id, quantity: quantity, size: size, price: productData.offerPrice }]
            const total = parseInt(productData.offerPrice * quantity);
            cart = new Cart({
                user, items, total
            })
            const cartData = await cart.save();
            return res.status(200).json({ success: true, message: "new cart Added" })
        } else {

            const productData = await Product.findOne({ _id: productId })
            const existproductIndex = cart.items.findIndex(item => item.product.toString() === productId && item.size === size)
            if (existproductIndex !== -1) {
                cart.items[existproductIndex].quantity += quantity;
                // cart.total += parseInt(cart.items[existproduct].salePrice * quantity);
                cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

            } else {


                cart.items.push({ product: productData._id, quantity: quantity, size: size, price: productData.offerPrice })
                // cart.total += parseInt(productData.salePrice * quantity);
                cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)
            }
            const updatedCart = await cart.save();
            const productCount = cart.items.reduce((count,item)=> count + item.quantity,0);

            return res.status(200).json({ success: true, message: "product added cart Items or added quantity" ,productCount });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const viewCart = async (req, res) => {
    try {
        const user = req.session.user_id;
        const cart = await Cart.findOne({ user: user }).populate('items.product');
        
        if(!cart || !cart.items||cart.items.length===0){
            
           return res.render('cart',{cart:cart,user})
        }

        for(const items of cart.items){
            const products = await Product.findOne({_id:items.product._id})
            if(products){
                const selectedSizeObj = products.sizes.find(sizeObj => sizeObj.size === items.size);
           
                if(selectedSizeObj){
                    items.stock = selectedSizeObj.stock;
                }
            }
        }   
      
        res.render('cart', { cart: cart, user,})
    } catch (error) {
        // return res.status(500).json({ Success: false, message: "Internal Server error" })
        console.log(error)
    }

}

const deleteItem = async (req, res) => {
    try {

        const productId = req.params.productId;
        const size = req.params.size;
        const user = req.session.user_id;

    const cart = await Cart.findOneAndUpdate({ user: user }, { $pull: { items: { product: productId, size: size } } },{new:true});

    let total = 0 ;
    cart.items.forEach(item=>{
        total+=item.price*item.quantity
    })
    await Cart.findOneAndUpdate({user:user},{$set:{total:total}});
        
        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const updateQuantity = async (req, res) => {
    try {


        const { productId, Action, size } = req.params;
        const user = req.session.user_id;


        let updatedCart;

        if (Action === 'inc') {
            

            updatedCart = await Cart.updateOne({
                user: user,
                items: {
                    $elemMatch: {
                        product: productId,
                        size: size
                    }
                }
            }, { $inc: { "items.$.quantity": 1 } }, { new: true })

        } else if (Action === 'dec') {

            updatedCart = await Cart.updateOne({
                user: user,
                items: {
                    $elemMatch: {
                        product: productId,
                        size: size,
                        quantity:{$gt:1}
                    }
                }
            }, { $inc: { "items.$.quantity": -1 } }, { new: true })
        }
        if (!updatedCart) {
            return res.status(404).json({ success: false, message: "Cart or item not found" });
        }

        const cart = await Cart.findOne({ user: user });
        cart.total = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
        await cart.save();

        const cartData = await Cart.findOne({
            user: user,
            items: {
                $elemMatch: {
                    product: productId,
                    size: size
                }
            }
        }, { _id: 0, 'items.$': 1 });

        console.log('cart dataaaa:',cartData);

        const productArray = cartData.items[0];

        console.log('product arryyyy;',productArray);

        if(productArray.quantity<1){
            productArray.quantity=1;
            await cart.save();
        }


        
        // const productData = await Product.findOne({_id:productId});
        // console.log('productData----;',productData);
        
        // if(productData){
        //     const selectedSizeObj = productData.sizes.find(sizeObj => sizeObj.size === size);
        //     stock = selectedSizeObj ? selectedSizeObj.stock : 0 ;
        // }

        const productData = await Product.findOne({ _id: productId });
        console.log('productData:', productData);

        let stock = 0; // Initialize stock variable

        if (productData) {
            const selectedSizeObj = productData.sizes.find(sizeObj => sizeObj.size === parseInt(size));
            if (selectedSizeObj) {
                stock = selectedSizeObj.stock;
            }
        }


        console.log('This is the stock:',stock);
console.log(productArray);
        return res.status(200).json({ productArray, cart ,total:cart.total,stock});

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const getTotal = async (req, res) => {
    try {
        const user = req.session.user_id;
        const cart = await Cart.findOne({ user: user });

        if (cart) {
            return res.status(200).json({ total: cart.total })
        } else {
            return res.status(200).json({ total: 0 });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const productCount = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const cart = await Cart.findById(userId);
        if (!cart) {
            return res.status(404).json({ success: false, message: 'No cart' });
        }

        let productCount = 0;
        for (const item of cart.items) {
            productCount += item.quantity;

        }
        return res.status(200).json({ productCount });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


module.exports = {
    viewCart,
    addToCart,
    deleteItem,
    updateQuantity,
    getTotal,
    productCount
}