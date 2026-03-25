const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
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
  remaningSlots: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  bookingStatus:{
    type: Boolean,
    required: true,
    default: false
  },
  hostId: {
    type: String,
    required: true
  },
  eventId:{
    type:String,
    required: true
  }
}, {
  timestamps: true
}
);

module.exports = mongoose.model('EventDetials', eventSchema);