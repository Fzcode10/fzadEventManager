const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Event title is required'], 
    trim: true 
  },
  eventOrganizer: { 
    type: String, 
    required: [true, 'Community or Organizer name is required'],
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
  remaningSlots: { 
    type: Number, 
    default: 0 // 0 could represent unlimited
  },
  bookingStatus: {
    type: Boolean,
    required: true,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('EventDetials', eventSchema);