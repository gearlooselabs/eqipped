
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const subSchema = new Schema({
    category: { type: Schema.Types.ObjectId, ref: 'Category'},
    name: { type: String, lowercase: true},
    product: [
        {
            type: Schema.Types.ObjectId, ref: 'Product'
        }
    ],
    created: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Sub', subSchema);