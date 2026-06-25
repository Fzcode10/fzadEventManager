const mongoose = require("mongoose");
const { nanoid } = require('nanoid');
const userLogin = require('./userLogin');

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
    // unique: true, // if this unique then user can't register in multiple events so we have to cheeck this on registration with aline of email and eventId
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
    type: String,
  },

  eventName: {
    type: String,
    required: true,
    default: "fzad"
  },

  registrationId: {
    type: String,
    unique: true
  },

  eventId: {
    type: String,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "free", "rejected"],
    default: "pending"
  },

  eventStatus: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

visitorSchema.statics.register = async function (fullName, email, phone, collegeName, department, year, eventName, eventId, userId) {
  const exists = await userLogin.findOne({ email });
  const alreadyRegister = await this.findOne({ email, eventId });

  if (!exists) {
    throw Error("Signup first");
  }

  if (alreadyRegister) {
    throw Error("Already Register");
  }

  const rId = createRegistrationId();

  const visitorRegister = await this.create({ fullName, email, phone, collegeName, department, year, eventName, eventId, userId, registrationId: rId });

  if (!visitorRegister) {
    throw Error("Registration failed!");
  }

  return visitorRegister;
}

module.exports = mongoose.model("VisitorRrgistrationodule", visitorSchema);