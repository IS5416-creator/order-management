const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    customerName: {type: String},
    email: {type: String},
    phone: {type: Number}
})

const Customer = mongoose.model('Customer',customerSchema)

module.exports = Customer