import { Request, Response } from 'express';
import User from '../models/User';
import Teacher from '../models/Teacher';
import Spoc from '../models/Spoc';
import { asyncHandler } from '../middlewares/errorHandler';
import { hashPassword } from '../utils/hashUtils';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { role, page = 1, limit = 10, search } = req.query;
  
  const filter: any = { isActive: true };
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNo: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await User.countDocuments(filter);

  res.json({
    users,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already taken' });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({ 
    message: 'User updated successfully',
    user: updatedUser 
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Soft delete
  await User.findByIdAndUpdate(req.params.id, { isActive: false });

  res.json({ message: 'User deleted successfully' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const hashedPassword = await hashPassword(newPassword);
  
  await User.findByIdAndUpdate(req.params.id, { 
    password: hashedPassword 
  });

  res.json({ message: 'Password reset successfully' });
});