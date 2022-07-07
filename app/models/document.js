const mongoose = require('mongoose')
const Schema = mongoose.Schema

const documentSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    rtype: { type: String, required: true},
    gstn: { type: String},
    cin: { type: Number, required: true},
    pan: { type: String, required: true},
    udise: { type: String, required: true},
    doc: { type: String, required: true},
})

module.exports = mongoose.model('Document', documentSchema);