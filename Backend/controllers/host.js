const visitorCheckStatusModule = require('../models/visitorCheckInOut');
const VisitorModule = require('../models/visitorRegisteration');
const nodemailer = require('nodemailer');

exports.allRegistredEmail = async (req, res) => {

    const {eventName} = req.body;

    try{
        if(!eventName) {
            throw Error("Enter event name properly");
        }

        const visitors = await VisitorModule.find({eventName});

        if(!visitors || visitors.length === 0){
            throw Error("No visitor found");
        }

        return res.status(200).json({
            visitors: visitors
        })

    }catch(error) {
        return res.status(404).json({
            error: error.message
        })
    }
}

exports.makeFree = async (req, res) => {

  try {
    const { registrationId } = req.body;

    const visitor = await VisitorModule.findOneAndUpdate(
      { registrationId },
      { paymentStatus: "Free" },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    res.status(200).json({
      message: "Payment status updated to Free",
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

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation for ${eventName}`,
      html: `
        <h2>You are Invited 🎉</h2>
        <p>You are invited to <b>${eventName}</b>.</p>
        <p>Please register soon!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Invitation sent successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};