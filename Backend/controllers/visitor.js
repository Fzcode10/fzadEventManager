const VisitorLoginModule = require('../models/visitorLogin');
const VisitorModule = require('../models/visitorRegisteration');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const QRCode = require("qrcode");

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
}

// Signup Visitor
exports.signupVisitor = async (req, res) => {

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
        const token = createToken(visitor._id);

        return res.status(200).json({
            visitor, token
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

    console.log(req.body);

    try {

        if (!email || !password) {
            throw Error("Fill all mindatory field!!");
        }

        const visitor = await VisitorLoginModule.login(email, password);

        console.log(visitor);

        const token = createToken(visitor._id);

        return res.status(200).json({
            visitor, token
        })


    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}


// Registration for event 
exports.registerEvent = async (req, res) => {

    console.log(req.body);

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
        eventName
    } = req.body;

    try {
        if (!fullName || !email || !phone || !collegeName || !eventName) {
            throw Error("Fill all mindatory field");
        }

        if (!validator.isEmail(email)) {
            throw Error("Invalid Email");
        }

        const registeration = await VisitorModule.register(fullName,
            email,
            phone,
            collegeName,
            department,
            year,
            eventName
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
    const { email } = req.body;

    try {
        const event = await VisitorModule.find({ email });

        if (!event) {
            throw Error("Event not found");
        }

        return res.status(200).json({
            event
        })

    } catch (error) {
        return res.status(400).json({
            error: error.message
        })
    }
}

exports.getticket = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            throw Error("Invaild Email");
        }

        const visitor = await VisitorModule.findOne({ email });

        if (!visitor) {
            throw Error("Register first");
        }

        if (!visitor.eventStatus) {
            throw Error("Event completed");
        }

        if (visitor.paymentStatus == "Pending") {
            throw Error("Waiting for permission");
        }

        // Create QR data object
        const qrData = JSON.stringify({
            eventName: visitor.eventName,
            registrationId: visitor.registrationId
        });

        // Generate QR as Base64
        const qrImage = await QRCode.toDataURL(qrData);
        
        return res.status(200).json({
            msg: "Generated qr",
            qr: qrImage
        });

    } catch (error) {
        return res.status(404).json({
            error: error.message
        })
    }
}