const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categoriesSchema = new Schema({
    pcategory: {type: String, required: true},
    pimage: {type: String, required: true},
    psubcat: [
        {
            type: Schema.Types.ObjectId, ref: 'Sub'
        }
    ],
    created: { type: Date, default: Date.now},
})

module.exports = mongoose.model('Category', categoriesSchema);