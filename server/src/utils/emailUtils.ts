// server/src/utils/emailUtils.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  const info = await transporter.sendMail({
    from: `AI Exam Evaluator <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`
  });
  if (info.rejected && info.rejected.length > 0) {
    throw new Error(`Failed to send OTP to: ${info.rejected.join(', ')}`);
  }
  return info;
}
