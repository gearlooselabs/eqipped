const mongoose = require('mongoose')
const Schema = mongoose.Schema

const otpSchema = new Schema({
    phone: {type: String, required: true},
    otp: {type: String, required: true},
    email: {type: String, required: true},
    eotp: {type: String, required: true},
    attempts: {type: Number},
    createdAt: {type: Date, expires: '1m', default: Date.now, index: true}

}, {timestamps: true })


module.exports = mongoose.model('Otp', otpSchema);