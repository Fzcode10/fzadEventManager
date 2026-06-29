const userLogin = require('../models/userLogin');
const jwt = require('jsonwebtoken');
const EventDetials = require('../models/eventDetiials');
const { nanoid } = require('nanoid');
const sendMail = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const uploadCloudinary = require('../config/cloudinary.js');
const OTP = require('../models/otpStoreModel');
const visitorCheckStatusModule = require('../models/visitorCheckInOut');
const VisitorRrgistrationodule = require('../models/visitorRegisteration');

exports.getProfile = async (req, res) => {
  try {
    const decoded = req.user;

    if (!decoded) {
      return res.status(400).json({
        msg: "User token may not valid"
      })
    }

    // 2. Find user and only fetch needed fields from DB
    // We fetch 'name', 'email', and 'role'
    const user = await userLogin.findById(decoded.id).select('name email role profilePhoto');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Format the response as requested
    res.status(200).json({
      fullName: user.name, // Mapping 'name' to 'fullName'
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto
    });

  } catch (error) {
    console.error("JWT Error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(403).json({ message: "Invalid Token" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const decoded = req.user;

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can create events'
      });
    }

    const {
      title,
      eventOrganizer,
      description,
      dateOFEvent,
      location,
      category,
      remaningSlots
    } = req.body;

    // Validation check
    if (!title || !eventOrganizer || !dateOFEvent || !location || !remaningSlots) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields."
      });
    }

    // Generate a unique eventId (required by schema)
    const eventId = `${nanoid(10).toUpperCase()}`;

    // Create the new event with all required schema fields
    const newEvent = new EventDetials({
      title,
      eventOrganizer,
      description,
      dateOFEvent,
      location,
      category,
      remaningSlots,
      hostId: decoded.id,   // required by schema
      eventId: eventId      // required by schema
    });

    // Save to MongoDB
    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      data: savedEvent
    });

  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.allEvents = async (req, res) => {
  try {
    const decoded = req.user;

    if (!decoded) {
      return res.status(400).json({
        success: false,
        msg: "User token may not valid"
      })
    }

    const user = await userLogin.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can access all events'
      });
    }

    const allowedCategories = ['Workshop', 'Seminar', 'Coding Contest', 'Webinar', 'Other', 'pending'];
    const { category = 'all', live = 'false', date } = req.query;

    const query = {};

    if (category !== 'all') {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category value'
        });
      }
      query.category = category;
    }

    const isLiveOnly = String(live).toLowerCase() === 'true';
    if (isLiveOnly) {
      const baseDate = date ? new Date(date) : new Date();

      if (Number.isNaN(baseDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const startOfDay = new Date(baseDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(baseDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.dateOFEvent = { $gte: startOfDay, $lte: endOfDay };
      query.status = 'approved';
    }
    console.log(query);

    let events;

    if (category === 'pending') {
      events = await EventDetials.find({ status: 'pending' }).select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus lastUpdatedByHost updateHistory hostId eventId createdAt')
        .sort({ dateOFEvent: 1, createdAt: -1 })
        .lean();
    } else {
      events = await EventDetials.find(query)
        .select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus lastUpdatedByHost updateHistory hostId eventId createdAt')
        .sort({ dateOFEvent: 1, createdAt: -1 })
        .lean();
    }

    const hostIds = [...new Set(events.map((event) => event.hostId).filter(Boolean))];
    const hosts = await userLogin.find({ _id: { $in: hostIds } })
      .select('_id email name')
      .lean();

    const hostMap = new Map(hosts.map((host) => [String(host._id), host]));

    const eventsWithHostInfo = events.map((event) => {
      const host = hostMap.get(String(event.hostId));

      return {
        ...event,
        hostEmail: host?.email || '',
        hostName: host?.name || ''
      };
    });

    res.status(200).json({
      success: true,
      events: eventsWithHostInfo
    })

  } catch (error) {
    res.status(400).json({
      error: error.message
    })
  }
}

exports.updateEventStatus = async (req, res) => {
  try {
    const decoded = req.user;

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can update event status'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Event id and status are required'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    let bookingStatus = false;

    if (status === 'approved') {
      bookingStatus = true;
    }

    const updatedEvent = await EventDetials.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updateStatus: false,
          lastUpdatedByHost: false,
          bookingStatus: bookingStatus
        }
      },
      { new: true }
    ).lean();

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event ${status} successfully`,
      event: updatedEvent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to update event status'
    });
  }
};

exports.requestEventUpdate = async (req, res) => {
  try {
    const decoded = req.user;

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can request event updates'
      });
    }

    const { id } = req.params;
    const { instruction } = req.body;
    console.log(instruction);

    if (!id || !instruction || !instruction.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Event id and instruction are required'
      });
    }

    const event = await EventDetials.findById(id);
    console.log(event);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const host = await userLogin.findById(event.hostId).select('email name');

    if (!host || !host.email) {
      return res.status(404).json({
        success: false,
        message: 'Host email not found for this event'
      });
    }

    await sendMail(
      host.email,
      `Update Required For Event: ${event.title}`,
      `
      <h2>Event Update Request</h2>
      <p>Hi ${host.name || 'Host'},</p>
      <p>Your event <b>${event.title}</b> requires updates before approval.</p>
      <p><b>Admin Instruction:</b></p>
      <p>${instruction.trim()}</p>
      <p>Please update the event plan (date, timing, or any required section) and resubmit.</p>
      <br/>
      <p>Thanks,<br/>Admin Team</p>
      `
    );

    event.updateStatus = true;
    event.status = 'pending';
    event.bookingStatus = false;
    event.lastUpdatedByHost = false;
    event.updateHistory.push({
      instruction: instruction.trim(),
      sentAt: new Date(),
      sentBy: 'admin'
    });
    await event.save();

    const updatedEvent = await EventDetials.findById(id)
      .select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus lastUpdatedByHost updateHistory hostId eventId createdAt')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Update request email sent to host',
      event: {
        ...updatedEvent,
        hostEmail: host.email,
        hostName: host.name || ''
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to send update request email'
    });
  }
};

exports.adNewStaff = async (req, res) => {
  try {

    const { email, name, password, role } = req.body;

    // console.log(req.body);
    // 1. Validation
    if (!email || !name || !password || !role) {
      // Using return to stop execution immediately
      return res.status(400).json({
        success: false,
        error: "All fields (email, name, password, role) are required."
      });
    }

    const user = req.user;
    // console.log(userRole);
    if (user.role !== "admin") {
      throw Error("Function unauthorized");
    }

    const staff = await userLogin.signup(email, password, name);

    // 4. Assign Role & Creator Metadata
    staff.role = role;
    staff.createdBy = user.id;
    await staff.save();


    res.status(201).json({
      success: true,
      newStaff: {
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.sendUpdateOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await userLogin.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const email = user.email;
    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpData = new OTP({
      email,
      otp
    });

    await otpData.save();

    await sendMail(
      email,
      "Your Profile Update Verification Code",
      `
      <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:40px 0;">
        <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
          <div style="background:#4f46e5; padding:20px; text-align:center;">
            <h1 style="color:white; margin:0; font-size:22px;">Profile Update Verification</h1>
          </div>
          <div style="padding:30px; text-align:center;">
            <h2 style="color:#333; margin-bottom:10px;">Verify Your Identity</h2>
            <p style="color:#666; font-size:14px;">Use the One-Time Password (OTP) below to authorize the changes to your profile details.</p>
            <div style="background:#f0f2f5; display:inline-block; padding:15px 30px; border-radius:8px; font-size:28px; font-weight:bold; letter-spacing:4px; color:#4f46e5; margin:20px 0;">
              ${otp}
            </div>
            <p style="color:#999; font-size:12px;">This code is valid for 5 minutes. If you did not request this update, please ignore this email.</p>
          </div>
        </div>
      </div>
      `
    );

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: "OTP is required to verify changes" });
    }

    const user = await userLogin.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email: user.email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    // OTP is correct. Clean up OTP record.
    await OTP.deleteOne({ _id: otpRecord._id });

    // Handle Profile Photo upload to Cloudinary if provided
    let profilePhoto = user.profilePhoto;
    if (req.file) {
      const uploadResult = await uploadCloudinary(req.file.path);
      profilePhoto = uploadResult?.secure_url || uploadResult?.url;
      if (!profilePhoto) {
        return res.status(400).json({ error: "Profile photo upload failed" });
      }
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update password if provided
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getCheckLogs = async (req, res) => {
  try {
    const decoded = req.user;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    let logs = await visitorCheckStatusModule.find(query).lean();

    const registrationIds = logs.map(l => l.registrationId);
    const registrations = await VisitorRrgistrationodule.find({ registrationId: { $in: registrationIds } }).lean();
    const regMap = new Map(registrations.map(r => [r.registrationId, r]));

    let results = logs.map(log => {
      const reg = regMap.get(log.registrationId);
      return {
        ...log,
        visitorName: reg ? reg.fullName : 'N/A',
        visitorEmail: reg ? reg.email : 'N/A',
        phone: reg ? reg.phone : 'N/A',
        collegeName: reg ? reg.collegeName : 'N/A'
      };
    });

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(r => 
        r.visitorName.toLowerCase().includes(searchLower) ||
        r.registrationId.toLowerCase().includes(searchLower) ||
        r.eventName.toLowerCase().includes(searchLower)
      );
    }

    results.sort((a, b) => new Date(b.checkIntime) - new Date(a.checkIntime));

    return res.status(200).json({ success: true, logs: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const decoded = req.user;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const { search, paymentStatus } = req.query;
    let query = {};
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    let visitors = await VisitorRrgistrationodule.find(query).sort({ createdAt: -1 }).lean();

    if (search) {
      const searchLower = search.toLowerCase();
      visitors = visitors.filter(v => 
        v.fullName.toLowerCase().includes(searchLower) ||
        v.email.toLowerCase().includes(searchLower) ||
        v.registrationId.toLowerCase().includes(searchLower) ||
        v.eventName.toLowerCase().includes(searchLower)
      );
    }

    return res.status(200).json({ success: true, visitors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const { type } = req.query;

    let filter = {};

    if (type && type !== "all") {
      if (["admin", "host", "visitor", "security"].includes(type)) {
        filter = { role: type };
      } else if (type === "other") {
        filter = { role: { $ne: "visitor" } };
      } else {
        filter = { role: type };
      }
    }

    const users = await userLogin.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "host", "visitor", "security"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing role. Must be 'admin', 'host', 'visitor', or 'security'.",
      });
    }

    const targetUser = await userLogin.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not allow changing own role to prevent self-lockout
    if (String(targetUser._id) === String(user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const { id } = req.params;

    const targetUser = await userLogin.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not allow deleting own account
    if (String(targetUser._id) === String(user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    await userLogin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};