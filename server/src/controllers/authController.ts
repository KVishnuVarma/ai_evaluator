// controllers/authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/hashUtils';
import { asyncHandler } from '../middlewares/errorHandler';
import { isValidRole } from '../config/roleConstants';
import { generateToken } from '../utils/tokenUtils';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, name, rollNo } = req.body;

  // Validation
  if (!email || !password || !role || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!isValidRole(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (role === 'student' && !rollNo) {
    return res.status(400).json({ message: 'Roll number is required for students' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      ...(rollNo ? [{ rollNo }] : [])
    ]
  });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    name,
    rollNo: role === 'student' ? rollNo : undefined
  });

  // Generate token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNo: user.rollNo
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNo: user.rollNo
    }
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      rollNo: user.rollNo,
      isActive: user.isActive
    }
  });
});