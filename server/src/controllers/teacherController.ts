import Teacher from '../models/Teacher';
import User from '../models/User';
import Paper from '../models/Paper';
import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/errorHandler';

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { userId, employeeId, subjects } = req.body;

  if (!userId || !employeeId || !subjects || !Array.isArray(subjects)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user exists and is a teacher
  const user = await User.findById(userId);
  if (!user || user.role !== 'teacher') {
    return res.status(400).json({ message: 'Invalid user or user is not a teacher' });
  }

  // Check if teacher profile already exists
  const existingTeacher = await Teacher.findOne({ userId });
  if (existingTeacher) {
    return res.status(400).json({ message: 'Teacher profile already exists' });
  }

  const teacher = await Teacher.create({
    userId,
    employeeId,
    subjects
  });

  const populatedTeacher = await Teacher.findById(teacher._id)
    .populate('userId', 'name email');

  res.status(201).json({
    message: 'Teacher profile created successfully',
    teacher: populatedTeacher
  });
});

export const getAllTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, subject } = req.query;

  let filter: any = { isActive: true };
  if (subject) {
    filter.subjects = { $in: [subject] };
  }

  const teachers = await Teacher.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Teacher.countDocuments(filter);

  res.json({
    teachers,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('assignedPapers');

  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  res.json({ teacher });
});

export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { subjects, isActive } = req.body;

  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { subjects, isActive },
    { new: true, runValidators: true }
  ).populate('userId', 'name email');

  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  res.json({
    message: 'Teacher updated successfully',
    teacher
  });
});

export const assignPaper = asyncHandler(async (req: Request, res: Response) => {
  const { paperId } = req.body;
  const teacherId = req.params.id;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }

  const paper = await Paper.findById(paperId);
  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  // Add paper to teacher's assigned papers
  await Teacher.findByIdAndUpdate(teacherId, {
    $addToSet: { assignedPapers: paperId }
  });

  // Update paper status
  await Paper.findByIdAndUpdate(paperId, {
    status: 'teacher_reviewing'
  });

  res.json({ message: 'Paper assigned successfully' });
});