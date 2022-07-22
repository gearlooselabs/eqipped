const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        sellerRole: { type: String },
        name: {type: String},
        image: {type: String, default: 'default.png'},
        price: {type: Number},
        size: {type: String},
        brand: {type: String},
        description: {type: String},
        piecePerPack: {type: Number},
        categoryName: {type: mongoose.Schema.Types.ObjectId, ref: "Category"},
        itemWeight: {type: String},
        subCategory: {type: mongoose.Schema.Types.ObjectId, ref: "Sub"},
        volume: {type: String, required: false },
        HSN :{type: Number },
        GST :{type: Number },
        netQuantity: {type: String},
        containedLiquid: {type: String, required: false},
        isverified: {type: String , default: "No"},
        variations: [
            { 
                type: Schema.Types.ObjectId, ref: 'Variation'
            }
        ]
    },
    { timestamps: true }
);
module.exports = mongoose.model('Product', productSchema);
 