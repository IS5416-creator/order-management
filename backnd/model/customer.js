const mongoose = require('mongoose')

const clothSchema = new mongoose.Schema({
    customerName: {type: String},
    email: {type: String},
    phone: {type: Number}
})

const Customer = mongoose.model('Customer',movieSchema)

module.exports = Customer