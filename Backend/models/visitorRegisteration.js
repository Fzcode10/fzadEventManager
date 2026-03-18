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

  userId: {
    type: String,
    required: true
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
    required: true,
    default: "fzad"
  },

  photo: {              // 👈 Added here
    type: String
  },

  registrationId: {
    type: String,
    unique: true
  },

  eventId:{
    type: String,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Free"],
    default: "Pending"
  },
  
  eventStatus :{
    type: Boolean,
    default: true
  }
  
}, {
    timestamps: true
});

visitorSchema.statics.register = async function (fullName, email, phone, collegeName, department, photo, year, eventName, eventId , userId ){
  const exists = await VisitorLoginModule.findOne({email});
  const alreadyRegister = await this.findOne({email, eventName});

  if(!exists) {
    throw Error("Signup first");
  }

  if(alreadyRegister){
    throw Error("Already Register"); 
  }
  
  const rId = createRegistrationId();

  const visitorRegister = await this.create({fullName, email, phone, collegeName, department, photo, year, eventName,eventId, userId, registrationId : rId});

  if(!visitorRegister) {
    throw Error("Registration failed!");
  }

  return visitorRegister;
}

module.exports = mongoose.model("VisitorRrgistrationodule", visitorSchema);