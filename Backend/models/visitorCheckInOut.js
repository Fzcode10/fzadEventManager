const mongoose = require('mongoose');

const visitorCheckInOutSchema = new mongoose.Schema({
    registrationId: {
        type: String,
        required: true
    }, eventName:{
        type: String,
        required: true
    }, checkIntime:{
        type: Date,
        default: null
    }, checkOutTime:{
        type:Date,
        default: null
    }
});

module.exports = mongoose.model("visitorCheckStatusModule", visitorCheckInOutSchema);