const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    orderId: { type: String, required: true },
    txnDate: { type: String, required: true },
    txnAmount: { type: String, required: true },
    items: { type: Object },
    // bankName:{ type: String, required: true },
    bankTxnId: { type: String, required: true },
    gateWayName: { type: String, required: true },
    paymentMode:{ type: String, required: true },
    respcode: { type: String, required: true },
    txnStatus:{ type: String, required: true },
    respmsg:{ type: String, required: true },
    txnID: { type: String, required: true },
    status: { type: String, default: "order_placed" },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
