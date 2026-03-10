const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    };

    console.log(transporter);

    const mailResponse = await transporter.sendMail(mailOptions);
    console.log(process.env.EMAIL_USER);

    if (!mailResponse.accepted.length) {
        throw new Error("Mail not sent");
    }

    return mailResponse;
};

module.exports = sendMail;