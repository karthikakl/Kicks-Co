const Product = require('../Model/productModel')
const Category = require('../Model/categoryModel');
const { deleteImage } = require('../config/multer');
const User = require("../Model/userModel");
const Offer = require("../Model/offerModel");


const products = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('product', { products })
    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const addPage = async (req, res) => {
    try {
        const category = await Category.find()
        res.render('addProduct', { category })
    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const addProduct = async (req, res) => {
    try {
        const { name, description, orginalPrice, offerPrice, category, brand, sizes } = req.body
        const images = req.files

        console.log('receiced request to add product', req.body.brand);

        const sizeArray = sizes.map((size) => ({
            size: parseInt(size),
            stock: parseInt(req.body[`stockForSize${size}`])
        }));


        console.log('size array====:', sizeArray);

        const newProduct = new Product({
            name,
            description,
            image: images,
            orginalPrice,
            offerPrice,
            category,
            brand,
            sizes: sizeArray,
           

        });

        console.log('new product:', newProduct);


        const existingProduct = await Product.findOne({name:name})
        if(existingProduct){
            const errorMessage = 'Product already exists';
            res.redirect('/admin/products');
        }
        const productData = await newProduct.save();
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error);
        return res.status(500).json({ Success: false, message: "product" })
    }
}

const editProduct = async (req, res) => {
    try {
        const productId = req.query.id;

        const productData = await Product.findOne({ _id: productId })
        console.log("productData=======",productData)
        const categories = await Category.find()
        if (productData) {
            res.render('editProduct', { productData,categories })
        } else {
            res.redirect('/admin/products')
        }
    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" })
    }
}

const deleteProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        const filename = req.body.filename;

        const product = await Product.findById(productId);
        const index = product.image.findOne(image => image.filename === filename);
        const deleted = deleteImage(filename)

        if (deleted) {
            product.image.splice(index, 1);

        } else {
            return res.status(404).json({ success: false, message: 'Image file not found' });
        }
    } catch (error) {

    }
}
const updateProduct = async (req, res) => {
    try {
       
        const { id, name, description, orginalPrice, offerPrice, category, brand, sizes, } = req.body;
        const images = req.files;
        const deletedImages = req.body.deletedImages || [];

        const productData = await Product.findById(id);

        console.log('productData',productData)

        let updatedImages = [];
        if (productData && Array.isArray(productData.image)) {
            updatedImages = productData.image.filter(image => !deletedImages.includes(image.filename));
        }

        if (images && images.length > 0) {
            images.forEach(image => {
                updatedImages.push({ filename: image.filename });
            });
        }


        const sizeArray = sizes.map((size) => ({
            size: parseInt(size),
            stock: parseInt(req.body[`stockForSize${size}`])
        }));


        await Product.findByIdAndUpdate({ _id: id }, {
            $set: { name, description, orginalPrice, offerPrice, category, brand, sizes: sizeArray, image: updatedImages },

        }
        )
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const unPublish = async (req, res) => {

    const productId = req.params.id;
    try {
        await Product.findByIdAndUpdate(productId, { isPublished: false })
        res.status(200).json({ success: true, message: " Blocked" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const isPublish = async (req, res) => {
    const productId = req.params.id;
    try {
        await Product.findByIdAndUpdate(productId, { isPublished: true })
        res.status(200).json({ success: true, message: "user Blocked" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}


const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        await Product.findByIdAndDelete({ _id: id });
        res.redirect('/admin/products');
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const viewProduct = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId });

        if (product) {
            res.render('viewProduct', { product,user: userId  });
        } else {
            res.redirect('/admin/products');
        }

    } catch (error) {
        return res.status(500).json({ Success: false, message: "Internal Server error" });
    }

}

const deletedImages = async (req, res) => {
    try {
        const { imageId, filename } = req.body;
        console.log(req.body);


        const deleted = deleteImage(filename);
        console.log('deleted ayy--', deleted);
        if (deleted) {
            const product = await Product.findOneAndUpdate({ 'image.filename': filename }, { $pull: { image: { filename: filename } } })
            return res.status(200).json({ success: true, deleted });
        } else {
            res.status(500).json({ success: false, error: 'Failed to delete image' })
        }

    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).send('Internal server error')
    }
}




module.exports = {
    products,
    addPage,
    addProduct,
    editProduct,
    deleteProductImage,
    updateProduct,
    unPublish,
    isPublish,
    deleteProduct,
    viewProduct,
    deletedImages,
    

}