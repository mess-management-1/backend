const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.EMAIL}>`,
    to: email,
    subject: "Verify your email for Mess Management System",
    // text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Mess Management System</h2>
        <p>Hello,</p>
        <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
        <h3 style="color: #2c3e50; background: #f0f0f0; padding: 10px; display: inline-block;">${code}</h3>
        <p>This code is valid for the next 10 minutes.</p>
        <p>If you did not initiate this request, please ignore this email.</p>
        <br />
        <p>Best regards,<br />Mess Management Team</p>
      </div>
    `,
  });
}

module.exports = sendVerificationEmail;
