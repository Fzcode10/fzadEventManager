const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const createRegistrationId = () => {
  return `${nanoid(10).toUpperCase()}`;
};

const UserLoginSchema = new mongoose.Schema({
    userId : {
        type: String,
        required: true,
        unique: true
    }, name: {
        type: String,
        required: true,
        trim: true
    }, email: {
        type: String,
        required: true,
        lowercase: true
    }, password: {
        type: String,
        required: true
    }, role: {
        type: String,
        enum: ["admin", "host", "visitor", "security"],
        default: "visitor"
    }, profilePhoto: {
        type: String,
        default: null
    }, createdBy:{
        type: String,
        default: "visitor"
    }
}, {
    timestamps: true
});

UserLoginSchema.statics.signup = async function (email, password, name, profilePhoto = null) {
    console.log(email, password, name);
    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userId = createRegistrationId();

    const visitor = await this.create({userId, name, email, password: hash, profilePhoto });

    return visitor;
}

UserLoginSchema.statics.login = async function (email, password) {
    const exists = await this.findOne({ email });

    if (!exists) {
        throw Error("First signup, This email not Exists");
    }

    const match = await bcrypt.compare(password, exists.password);

    if (!match) {
        throw Error("Incorrect Password");
    }

    console.log(exists);

    return exists;
}

module.exports = mongoose.model("userLogin", UserLoginSchema);