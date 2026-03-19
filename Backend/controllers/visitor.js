const VisitorLoginModule = require('../models/visitorLogin');
const VisitorRrgistrationodule = require('../models/visitorRegisteration');
const OTP = require('../models/otpStoreModel');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const QRCode = require("qrcode");
const nodemailer = require('nodemailer');
const EventDetials = require('../models/eventDetiials');

// const createToken = (_id) => {
//     return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
// }

// Check the is Eamil exists
exports.isExist = async (req, res) => {
    const { email } = req.body;
    console.log(email);

    try {
        if (!email || !validator.isEmail(email)) {
            throw Error("Invalid email")
        }

        const visitor = await VisitorLoginModule.findOne({ email });

        if (visitor) {
            throw Error("Already signup!!");
        }

        return res.status(200).json({
            msg: "Email not available"
        })

    } catch (error) {
        return res.status(404).json({
            error: error.message
        })
    }
}

// Send otp t email
exports.sentOtp = async (req, res) => {

    try {

        const { email } = req.body;
        console.log(email);

        if (!email || !validator.isEmail(email)) {
            throw Error("Invalid email")
        }

        const visitor = await VisitorLoginModule.findOne({ email  });

        console.log(visitor);

        if (visitor) {
            throw Error("Already signup!!");
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const otpData = new OTP({
            email,
            otp
        });

        await otpData.save();

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
            subject: "Your Signup OTP Code",
            html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6fb; padding:40px 0;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:#4f46e5; padding:20px; text-align:center;">
        <h1 style="color:white; margin:0; font-size:22px;">
          Student Portal Verification
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:30px; text-align:center;">
        <h2 style="color:#333; margin-bottom:10px;">Verify Your Email</h2>
        <p style="color:#666; font-size:14px;">
          Use the One-Time Password (OTP) below to complete your signup process.
        </p>

        <!-- OTP BOX -->
        <div style="
          margin:30px auto;
          background:#f1f3ff;
          padding:20px;
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#4f46e5;
          border-radius:8px;
          width:220px;
        ">
          ${otp}
        </div>

        <p style="color:#666; font-size:14px;">
          This OTP will expire in <b>5 minutes</b>.
        </p>

        <p style="color:#888; font-size:12px; margin-top:25px;">
          If you did not request this code, please ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafc; padding:15px; text-align:center; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Student Portal System
      </div>

    </div>
  </div>
  `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

// Verify otp
exports.verifyOtp = async (req, res) => {

    try {

        const { email, otp } = req.body;
        // console.log(email, otp);

        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({
                error: "Invalid or expired OTP"
            });
        }

        res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

// Signup Visitor
exports.signupVisitor =  async (req, res) => {

    const { email, password, name } = req.body;

    // console.log(req.body);

    try {

        if (!email || !password || !name) {
            throw Error("Fill all mindatory field!!");
        }

        if (!validator.isEmail(email)) {
            throw Error("Invalid Email");
        }

        const visitor = await VisitorLoginModule.signup(email, password, name);
        // const token = createToken(visitor._id);
        const token = jwt.sign({
            id: visitor._id,
            role: visitor.role
        },   process.env.SECRET, { expiresIn: '3d' });

        return res.status(200).json({
            name:  visitor.name, role:  visitor.role, token
        })

    } catch (error) {
        return res.status(404).json({
            error: error.message
        })
    }
}

// Login Visitor
exports.loginVisitor = async (req, res) => {

    const { email, password } = req.body;

    // console.log(req.body);

    try {

        if (!email || !password) {
            throw Error("Fill all mindatory field!!");
        }

        const visitor = await VisitorLoginModule.login(email, password);

        // console.log(visitor);

        // const token = createToken(visitor._id);
        const token = jwt.sign({
            id: visitor._id,
            role: visitor.role
        },   process.env.SECRET, { expiresIn: '3d' });

        return res.status(200).json({
           name:  visitor.name, role:  visitor.role, token
        })


    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}


// Registration for event 
exports.registerEvent = async (req, res) => {

    // console.log(req.body.fullName);

    if (!req.body) {
        return res.status(400).json({ error: "Request body missing" });
    }

    const {
        fullName,
        email,
        phone,
        collegeName,
        department,
        year,
        eventName,
        eventId
    } = req.body;

    try {
        const userId = req.user.id;
        // console.log(userId);
        if (!fullName || !email || !phone || !collegeName || !eventName || !eventId || !userId) {
            throw Error("Fill all mindatory field");
        }
        // console.log(eventId);

        if (!validator.isEmail(email)) {
            throw Error("Invalid Email");
        }

        // console.log("BODY:", req.body);
        // console.log("FILE:", req.file);

        const photo = req.file ? req.file.path : null;

        const registeration = await VisitorRrgistrationodule.register(fullName,
            email,
            phone,
            collegeName,
            department,
            photo,
            year,
            eventName,
            eventId,
            userId
        );



        return res.status(200).json({
            registeration
        });

    } catch (error) {
        return res.status(404).json({
            error: error.message
        })
    }
}

exports.allEventDetials = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get registrations
    const registrations = await VisitorRrgistrationodule.find({ userId });

    if (!registrations.length) {
      return res.status(404).json({ message: "No events found" });
    }

    // 2. Extract eventIds
    const eventIds = registrations.map((item) => item.eventId);

    // 3. Get events
    const events = await EventDetials.find({
      _id: { $in: eventIds },
    });

    // 4. Merge event + paymentStatus
    const finalData = events.map((event) => {
      const registration = registrations.find(
        (r) => r.eventId.toString() === event._id.toString()
      );

      return {
        ...event.toObject(),
        paymentStatus: registration?.paymentStatus || "pending",
      };
    });

    return res.status(200).json({
      events: finalData,
    });

  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

exports.getticket = async (req, res) => {

    try {
        const {eventId } = req.body;
        const decoded = req.user;
        if ( !eventId) {
            return res.status(400).json({ error: "Invalid eventId" });
        }

        const visitor = await VisitorRrgistrationodule.findOne({ userId: decoded.id, eventId });

        if (!visitor) {
            return res.status(404).json({ error: "Register first" });
        }

        if (!visitor.eventStatus) {
            return res.status(400).json({ error: "Event completed" });
        }

        if (visitor.paymentStatus === "Pending") {
            return res.status(403).json({ error: "Waiting for permission" });
        }

        // QR data
        const qrData = JSON.stringify({
            eventName: visitor.eventName,
            registrationId: visitor.registrationId
        });

        // Generate QR as PNG buffer
        const qrBuffer = await QRCode.toBuffer(qrData);

        // Send PNG image
        res.type("png");
        return res.send(qrBuffer);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

exports.allEvent = async (req, res) => {
    try{
        const events = await EventDetials.find({bookingStatus: true});

        if(!events){
            throw Error("Unable tofind events");
        }

        return res.status(200).json({
            msg: "All event",
            events
        })

    }catch(error){
        return res.status(404).json({
            error: error.message
        })
    }
}