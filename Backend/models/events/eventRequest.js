const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  eventOrganizer: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  dateOFEvent: { 
    type: Date,
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  category: {
    type: String, 
    enum: ['Workshop', 'Seminar', 'Coding Contest', 'Webinar', 'Other'],
    default: 'Other'
  },
  slots: { 
    type: Number, 
    required: true, 
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  hostId: {
    type: String,
    required: true
  },
  eventId:{
    type: String,
    unique:true,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EventRequest', eventSchema);