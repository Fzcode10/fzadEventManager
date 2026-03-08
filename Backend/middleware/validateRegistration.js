// middleware/validateRegistration.js

const validator = require("validator");

const validateRegistration = (req, res, next) => {
    console.log(req.body);
  try {

    const {
      fullName,
      email,
      phone,
      collegeName,
      eventName
    } = req.body;

    if (!fullName || !email || !phone || !collegeName || !eventName) {
      throw new Error("Fill all mandatory fields");
    }

    if (!validator.isEmail(email)) {
      throw new Error("Invalid email");
    }

    if (!validator.isMobilePhone(phone.toString(), "en-IN")) {
      throw new Error("Invalid phone number");
    }

    next(); // move to next middleware

  } catch (error) {

    console.log(error);

    return res.status(400).json({
      error: error.message
    });

  }

};

module.exports = validateRegistration;