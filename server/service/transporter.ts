import nodemailer from 'nodemailer';
import { config } from '../config/config';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Your SMTP host
  port: 587, // Your SMTP port (e.g., 587 for TLS)
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export async function sentEmail(to:string,subject:string,text:string,html:string){
  transporter.sendMail({
      from: config.emailUser,
      to,
      subject,
      text,
      html,
    });
}