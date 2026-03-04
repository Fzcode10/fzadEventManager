const mongoose = require("mongoose");
const { nanoid } = require('nanoid');
const VisitorLoginModule = require('./visitorLogin');

const createRegistrationId = () => {
  return `TECH2026-${nanoid(6).toUpperCase()}`;
};

const visitorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: {
    type: Number,
    required: true
  },

  collegeName: {
    type: String,
    required: true
  },

  department: {
    type: String
  },

  year: {
    type: String,   // e.g., "1st Year", "2nd Year"
  },

  eventName: {
    type: String,
    required: true
  },

  registrationId: {
    type: String,
    unique: true
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Free"],
    default: "Pending"
  },

  checkInStatus: {
    type: Boolean,
    default: false
  },
  
  eventStatus :{
    type: Boolean,
    default: true
  }
  
}, {
    timestamps: true
});

visitorSchema.statics.register = async function (fullName, email, phone, collegeName, department, year, eventName ){
  const exists = await VisitorLoginModule.findOne({email});
  const alreadyRegister = await this.find({email});

  if(!exists) {
    throw Error("Signup first");
  }

  if(alreadyRegister){
    throw Error("Already Register"); 
  }
  
  const rId = createRegistrationId();

  const visitorRegister = await this.create({fullName, email, phone, collegeName, department, year, eventName, registrationId : rId});

  return visitorRegister;
}

module.exports = mongoose.model("VisitorModule", visitorSchema);