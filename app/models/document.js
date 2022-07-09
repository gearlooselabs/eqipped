const mongoose = require('mongoose')
const Schema = mongoose.Schema

const documentSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User'},
    registerAs: { type: String, required: true},
    cin: { type: Number },
    pan: { type: String },
    udise: { type: Number },
    gst: { type: String},
    man: { type: String}
})

module.exports = mongoose.model('Document', documentSchema);