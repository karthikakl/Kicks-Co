const mongoose = require("mongoose");
const orderitemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPicture: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  ItemPaymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  ItemDate: {
    type: Date,
    default: Date.now,
  },
  ItemPaymentMethod: {
    type: String,
    enum: ["COD", "razorpay", "wallet"],
    default: "COD",
  },
  ItemStatus: {
    type: String,
    enum: [
      "delivered",
      "pending",
      "cancelled",
      "return requested",
      "returned",
      "return not approved",
    ],
    default: "pending",
  },
});
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },

  items: [orderitemSchema],
  total: {
    type: Number,
    required: true,
  },
  address: {
    HouseName: {
      type: String,
      required: true,
    },
    Street: {
      type: String,
      required: true,
    },
    City: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "razorpay", "wallet"],
    default: "COD",
  },
  status: {
    type: String,
    enum: [
      "delivered",
      "pending",
      "cancelled",
      "returned",
      "return requested",
      "return not approved",
    ],
    default: "pending",
  },
});
module.exports = mongoose.model("Order", orderSchema);
