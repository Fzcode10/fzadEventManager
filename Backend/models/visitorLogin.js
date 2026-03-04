const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const VisitorLoginSchema = new mongoose.Schema({
    name:{
        type: String, 
        required: true,
        trim: true,
        unique: true
    }, email : {
        type: String,
        required: true,
        lowercase: true
    }, password :{
        type: String,
        required: true
    }
}, {
    timestamps: true
});

VisitorLoginSchema.statics.signup = async function(email, password, name){
    console.log(email, password, name);
    const exists = await this.findOne({email});

    if(exists){
        throw Error("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const visitor = await this.create({name, email, password: hash});

    return visitor;
}

VisitorLoginSchema.statics.login = async function (email, password){
    const exists = await this.findOne({email});

    if(!exists){
        throw Error("First signup, This email not Exists");
    }

    const match = await bcrypt.compare(password, exists.password);

    if(!match){
        throw Error("Incorrect Password");
    }
    
    console.log(exists);

    return exists;
}

module.exports = mongoose.model("VisitorLoginModule", VisitorLoginSchema);