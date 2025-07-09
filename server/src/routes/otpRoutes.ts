import express from 'express';
import { sendOtpEmail } from '../utils/emailUtils';

const router = express.Router();

// In-memory store for OTPs (for demo; use Redis or DB in production)
const otpStore: Record<string, string> = {};

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;
  try {
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ message: 'Failed to send OTP', error: err?.toString?.() || err });
  }
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ valid: true });
  } else {
    res.status(400).json({ valid: false, message: 'Invalid OTP' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }
  if (otpStore[email] !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  try {
    // Hash new password
    const { hashPassword } = require('../utils/hashUtils');
    const User = require('../models/User').default;
    const hashed = await hashPassword(newPassword);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashed },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    delete otpStore[email];
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password', error: err?.toString?.() || err });
  }
});

export default router;
