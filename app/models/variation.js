const mongoose = require('mongoose')
const Schema = mongoose.Schema

const variationSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product'},
    pname: { type: String},
    vcode: { type: String},
    variation: { type: String},
    brand: { type: String},
    category: { type: Schema.Types.ObjectId, ref: 'Category'},
    sub: { type: Schema.Types.ObjectId, ref: 'Sub'},
    name: { type: String},
    price: { type: Number},
    piecePerPack: { type: String},
    vendor: { type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true })


module.exports = mongoose.model('Variation', variationSchema); 