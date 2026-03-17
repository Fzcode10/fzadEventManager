const VisitorLoginModule = require('../models/visitorLogin');
const jwt = require('jsonwebtoken');
const EventDetials = require('../models/eventDetiials');

exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify and Decode
    const decoded = jwt.verify(token, process.env.SECRET);
    
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