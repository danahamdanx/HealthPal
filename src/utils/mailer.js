import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // 1. Create a transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password (see below)
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
    to: options.email,                 // Recipient email
    subject: options.subject,          // Email subject
    text: options.message,             // Plain text message
    html: options.html || undefined,   // Optional HTML message
    attachments: options.attachments || [], // Optional attachments
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${options.email}`);
};
