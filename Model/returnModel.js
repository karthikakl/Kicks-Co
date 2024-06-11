const mongoose = require("mongoose");
const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["requested", "approved", "rejected"],
    required: true,
  },
});
module.exports = mongoose.model("Return", returnSchema);
