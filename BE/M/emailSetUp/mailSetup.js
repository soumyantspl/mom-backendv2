const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  server: 'smtp.gmail.com',
  port: process.env.SMTP_PORT,
  auth: {
    user: 'no-reply@ntspl.co.in',
    pass: 'ntspl@123',
  },
});
const mailOptions = {
  from: `"${process.env.FROM_EMAIL_NAME}"<${process.env.FROM_EMAIL}>`,
  to: '',
  subject: 'Register Success',
  bcc: process.env.SB_EMAIL_ID,
  html: '<b>Welcome to MOM Management !!! :</b>',
  attachments: []
};
module.exports = {
  transporter, mailOptions,
};


