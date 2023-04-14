const nodemailer = require("nodemailer");

const config = require("../../../config");

async function sendEmail({ to, subject, html, from = config.email.from }) {
  const transporter = nodemailer.createTransport(config.email.smtpOptions);
  let emailResult = await transporter.sendMail({ from, to, subject, html });
  console.log("EMAIL RESULT", emailResult);
}

module.exports = {
  sendEmail,
};
