const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: [
    {
      filename: String,
    },
  ],

  orginalPrice: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },

  brand: {
    type: String,
    required: true,
  },

  sizes: [
    {
      size: {
        type: Number,
        required: true,
      },
      stock: {
        type: Number,
        required: true,
      },
    },
  ],
  offerId: {
    type: mongoose.Types.ObjectId,
    ref: "Offers",
  },

  isPublished: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
