const multer = require('multer')
const path = require('path')
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/product-images"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage
 });

const deleteImage = (filename) => {
    const imagePath = path.join(__dirname, '../public/product-images', filename);
    try {
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('image deletion completed', imagePath);
            return true;
        } else {
            console.log('image not found');
            return false;
        }
    } catch (error) {
        console.error('error occured', error);
        return false;
    }


}

module.exports = { upload, deleteImage };