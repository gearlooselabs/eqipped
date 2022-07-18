const mongoose = require('mongoose')
const Schema = mongoose.Schema

const variationSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product'},
    variation: { type: String},
    category: { type: Schema.Types.ObjectId, ref: 'Category'},
    sub: { type: Schema.Types.ObjectId, ref: 'Sub'},
    name: { type: String},
    price: { type: Number}
}, {timestamps: true })


module.exports = mongoose.model('Variation', variationSchema);