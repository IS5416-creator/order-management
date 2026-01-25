const mongoose = require('mongoose')

const clothSchema = new mongoose.Schema({
    productId: {type: Number},
    productName: {type: String, required:true },
    quantitiy: {type: Number},
    customerName: {type: String},
    total: {type: Number},
    status: {type: String},
    date: {type: Date}
})

const Order = mongoose.model('Order',movieSchema)

module.exports = Order