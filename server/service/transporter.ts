import nodemailer from 'nodemailer';
import { config } from '../config/config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // TLS
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export async function sentEmail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ success: boolean; message: string }> {
  try {
    const info = await transporter.sendMail({
      from: `"Quiz App" <${config.emailUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error("Error sending email:", error);

    return {
      success: false,
      message: error.message || "Failed to send email.",
    };
  }
}
