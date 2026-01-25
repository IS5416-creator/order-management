const mongoose = require('mongoose')

const clothSchema = new mongoose.Schema({
    productName: {type: String, required:true },
    category: {type: String},
    size: {type: String},
    color: {type: String},
    price: {type: Number},
    stock: {type: Number}
})

const Product = mongoose.model('Product',movieSchema)

module.exports = Product