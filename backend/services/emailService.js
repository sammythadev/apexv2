const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

const transporter = nodemailer.createTransport(emailConfig);

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  const mailOptions = {
    from: emailConfig.from,
    to: email,
    subject: 'Verify Your Email for ApexTrades',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4a6baf;">Welcome to ApexTrades!</h2>
        <p>Thank you for registering. Please verify your email address to complete your account setup.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4a6baf; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} ApexTrades. All rights reserved.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };