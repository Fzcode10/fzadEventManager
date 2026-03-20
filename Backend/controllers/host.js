const visitorCheckStatusModule = require('../models/visitorCheckInOut');
const VisitorRrgistrationodule = require('../models/visitorRegisteration');
const sendMail = require('../utils/mailSender');
const EventRequest = require('../models/events/eventRequest');
const { nanoid } = require('nanoid');

const createUniqueId = () => {
  return `${nanoid(10).toUpperCase()}`;
};

exports.allRegistredEmail = async (req, res) => {

  const { eventName } = req.body;

  try {
    if (!eventName) {
      throw Error("Enter event name properly");
    }

    const visitors = await VisitorRrgistrationodule.find({ eventName });

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

    const visitor = await VisitorRrgistrationodule.findOneAndUpdate(
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

exports.getUpcomingEvents = async (req, res) => {
  try {
    const token = req.user;
    // console.log(token);

    const events = await EventRequest.find({ hostId: token.id }).select("title description dateOFEvent location slots status category eventId");

    if (events.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No events scheduled yet",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      data: events
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

exports.createEventRequest = async (req, res) => {
  try {
    const token = req.user;

    const {
      title,
      eventOrganizer,
      description,
      dateOFEvent,
      location,
      category,
      slots
    } = req.body;

    if (!title || !eventOrganizer || !dateOFEvent || !location || !category || !slots) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const eventId = createUniqueId();

    // 🔥 If this fails → it goes directly to catch
    const event = await EventRequest.create({
      title,
      eventOrganizer,
      description,
      dateOFEvent,
      location,
      category,
      slots,
      hostId: token.id,
      eventId: eventId
    });

    return res.status(201).json({
      success: true,
      message: "Event request sent successfully",
      data: event
    });

  } catch (error) {
    // 🔥 Send proper error to frontend
    return res.status(500).json({
      success: false,
      message: error.message || "Database Error"
    });
  }
};