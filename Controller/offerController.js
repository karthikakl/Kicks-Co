const Products = require('../model/productModel');
const Category = require('../model/categoryModel');
const Offers = require('../model/offerModel');
const Coupon = require('../model/couponModel');
// const { default: products } = require('razorpay/dist/types/products');

const offerList = async(req,res)=>{
    try {
       const offers = await Offers.find().populate('product').populate('category');
      
       res.render('offerList',{offers:offers}) 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })
 
    }
}

const addOfferPage = async(req,res)=>{
    try {
        const products = await Products.find();
        const categories = await Category.find(); 
        res.render('addOffer',{products:products,categories:categories})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" }) 
    }
}

const addOffer = async(req,res)=>{
    try {
      const {productOrCategory,product,category,discountPercent,maxDiscountAmount,expiryDate}=req.body 

      let offerData ={};
      if(productOrCategory === 'product'){
        offerData ={
            product:product,
            discountPercent:discountPercent,
            maxDiscountAmount:maxDiscountAmount,
            ExpiryDate:expiryDate
        }
      }else if(productOrCategory === 'category'){
       

        offerData ={
            category:category,
            discountPercent:discountPercent,
            maxDiscountAmount:maxDiscountAmount,
            ExpiryDate:expiryDate
        }
      }

      

      const newOffer = new Offers(offerData);
      await newOffer.save();
      res.redirect('/admin/offerList');

      }  
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" })  
    }
}

const isList = async (req, res) => {
    try {
        const  offerId  = req.params.offerId;
        console.log('offerId',req.params.offerId)

       const offer = await Offers.findById(offerId).populate('category');
       console.log('offer:',offer)

       if(!offer){
        return res.status(404).json({ success: false, message: 'Offer not found' });
       }
      
       if(offer.product){
        const product = await Products.findById(offer.product)
        console.log('product:',product);


        if(!product){
            return res.status(404).json({ success: false, message: 'Product not found' }); 
        }
            let discount = product.orginalPrice * (offer.discountPercent/100);

            if(offer.maxDiscountAmount && discount > offer.maxDiscountAmount){
                discount = offer.maxDiscountAmount;
            }

            product.offerPrice = product.orginalPrice - discount;

            console.log('offerPrice',product.offerPrice);
            await product.save();


        }else if (offer.category){

            const category = offer.category
            console.log('Category===', category)
    
            console.log('category name===',category.name)
    
            const categoryName = category.name;
            console.log('categoryname====',categoryName);
                     
                 if(!offer.category){
                return res.status(404).json({success:false,message:'Category not found'});

            }
            const products = await Products.find({category:categoryName});
            
            console.log('products',products)

            if (!products || products.length === 0) {
                return res.status(404).json({ success: false, message: 'No products found in the category' });
            }

            for(const product of products){
                let discount = product.orginalPrice *(offer.discountPercent/100);
                if(offer.maxDiscountAmount && discount > offer.maxDiscountAmount){
                    discount = offer.maxDiscountAmount;
                }
                product.offerPrice = product.orginalPrice - discount;

                console.log('product price:',product.offerPrice);
                await product.save();
            }
        }
        await Offers.findByIdAndUpdate(offerId, { is_List: true });
       
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error' });
    }
}

const unList = async (req, res) => {
    try {
        const  offerId  = req.params.offerId;
        const offer = await Offers.findById(offerId).populate('category');
       console.log('offer:',offer)

       if(!offer){
        return res.status(404).json({ success: false, message: 'Offer not found' });
       }
      
       if(offer.product){
        const product = await Products.findById(offer.product)
       
        if(!product){
            return res.status(404).json({ success: false, message: 'Product not found' }); 
        }
            if(product.offerPrice){
                product.offerPrice = product.orginalPrice;
                await product.save();
            }
        }else if (offer.category){
            
            const category = offer.category
            console.log('Category===', category)
    
            console.log('category name===',category.name)
    
            const categoryName = category.name;
            console.log('categoryname====',categoryName);

            const products = await Products.find({category:categoryName});
            if(!products.length){
                return res.status(404).json({ success: false, message: 'No products found in the category' });
            }
            for(const product of products){
               if(product.offerPrice){

                product.offerPrice = product.orginalPrice
                await product.save();
               }
            }
        }
        await Offers.findOneAndUpdate({_id:offerId},{is_List:false});
       
        res.status(200).json({ success: true });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error' });
    }
}




module.exports ={
    offerList,
    addOfferPage,
    addOffer,
    isList,
    unList
}