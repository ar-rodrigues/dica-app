'use server'
import nodemailer from 'nodemailer';

export async function sendEmail(email, name, password, subject, body) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: "587" || "465" || process.env.EMAIL_PORT, 
    secure: process.env.EMAIL_PORT === '465' ? true : false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject || 'Welcome to Our Service!',
    html: body || `Hello ${name},\n\nYour account has been created successfully.\n\nYour login details are:\nEmail: ${email}\nPassword: ${password}\n\nPlease log in and change your password after your first login.\n\nThank you!`,
  };
  

  return transporter.sendMail(mailOptions);
}