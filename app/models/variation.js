const mongoose = require('mongoose')
const Schema = mongoose.Schema

const variationSchema = new Schema({
    name: { type: String},
    attributes: [
        { type: Schema.Types.ObjectId, ref: 'Attribute'}
    ]
   
}, {timestamps: true })


module.exports = mongoose.model('Variation', variationSchema);