const mongoose = require('mongoose');

const visitorCheckInOutSchema = new mongoose.Schema({
    registrationId: {
        type: String,
        required: true
    }, eventName: {
        type: String,
        required: true
    }, checkIntime: {
        type: Date,
        default: Date.now
    }, checkOutTime: {
        type: Date,
        default: null
    }, status: {
        type: String,
        enum: ["Pending", "IN", "OUT"],
        default: "Pending"
    },
});

module.exports = mongoose.model("visitorCheckStatusModule", visitorCheckInOutSchema);