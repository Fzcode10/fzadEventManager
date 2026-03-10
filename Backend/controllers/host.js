const visitorCheckStatusModule = require('../models/visitorCheckInOut');
const VisitorModule = require('../models/visitorRegisteration');
const nodemailer = require('nodemailer');
const sendMail = require('../utils/mailSender');

exports.allRegistredEmail = async (req, res) => {

  const { eventName } = req.body;

  try {
    if (!eventName) {
      throw Error("Enter event name properly");
    }

    const visitors = await VisitorModule.find({ eventName });

    if (!visitors || visitors.length === 0) {
      throw Error("No visitor found");
    }

    return res.status(200).json({
      visitors: visitors
    })

  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
}


exports.makeFreeAndInvitation = async (req, res) => {

  try {
    const { email, eventName } = req.body;

    if (!email || !eventName) {
      return res.status(400).json({ error: "Request body not complete" });
    }

    const visitor = await VisitorModule.findOneAndUpdate(
      { email, eventName },
      { paymentStatus: "Free" },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    await sendMail(
      email,
      `Invitation for ${eventName}`,
      `
      <h2>You are Invited 🎉</h2>
      <p>You are invited to <b>${eventName}</b>.</p>
      <p>Please collect your ticket from website...(Profile)</p>
      `
    );

    res.status(200).json({
      message: "Payment updated & invitation email sent successfully",
      visitor
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Invitation for Event
exports.sendInvite = async (req, res) => {

  try {
    const { email, eventName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    await sendMail(
      email,
      `Invitation for ${eventName}`,
      `
      <h2>You are Invited 🎉</h2>
      <p>You are invited to <b>${eventName}</b>.</p>
      <p>Please collect your ticket from website...(Profile)</p>
      `
    );

    res.status(200).json({ message: "Invitation sent successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};