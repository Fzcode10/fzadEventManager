const VisitorLoginModule = require('../models/visitorLogin');
const jwt = require('jsonwebtoken');
const EventDetials = require('../models/eventDetiials');
const sendMail = require('../utils/mailSender');

exports.getProfile = async (req, res) => {
  try {
    const decoded = req.user;

    if(!decoded){
      return res.status(400).json({
        msg: "User token may not valid"
      })
    }
    
    // 2. Find user and only fetch needed fields from DB
    // We fetch 'name', 'email', and 'role'
    const user = await VisitorLoginModule.findById(decoded.id).select('name email role');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Format the response as requested
    res.status(200).json({
      fullName: user.name, // Mapping 'name' to 'fullName'
      email: user.email,
      role: user.role
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
        const { 
            title, 
            eventOrganizer, 
            description, 
            dateOFEvent, 
            location, 
            category, 
            remaningSlots 
        } = req.body;

        // Validation check (Optional but recommended)
        if (!title || !eventOrganizer || !dateOFEvent || !location || !remaningSlots) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide all required fields." 
            });
        }

        // Create the new event
        const newEvent = new EventDetials({
            title,
            eventOrganizer,
            description,
            dateOFEvent,
            location,
            category,
            remaningSlots,
            createdBy:  "Faiz" // Assigning the ID from your auth middleware
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
  try{
    const decoded = req.user;

    if(!decoded){
      return res.status(400).json({
        success: false,
        msg: "User token may not valid"
      })
    }

    const user = await VisitorLoginModule.findById(decoded.id);

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

    if(category === 'pending'){
      events = await EventDetials.find({status: 'pending'}).select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus hostId eventId createdAt')
      .sort({ dateOFEvent: 1, createdAt: -1 })
      .lean();
    }else{
      events = await EventDetials.find(query)
        .select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus hostId eventId createdAt')
        .sort({ dateOFEvent: 1, createdAt: -1 })
        .lean();
    }

    const hostIds = [...new Set(events.map((event) => event.hostId).filter(Boolean))];
    const hosts = await VisitorLoginModule.find({ _id: { $in: hostIds } })
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

  }catch(error){
    res.status(400).json({
      error : error.message
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

    if(status === 'approved'){
      bookingStatus = true;
    }

    const updatedEvent = await EventDetials.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          updateStatus: false,
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

    const host = await VisitorLoginModule.findById(event.hostId).select('email name');

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
    await event.save();

    const updatedEvent = await EventDetials.findById(id)
      .select('title eventOrganizer description dateOFEvent location category remaningSlots status bookingStatus updateStatus hostId eventId createdAt')
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
    if(user.role !== "admin"){
      throw Error("Function unauthorized");
    } 
   
    const staff = await VisitorLoginModule.signup(email, password, name);

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