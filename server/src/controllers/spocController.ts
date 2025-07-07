// controllers/spocController.ts
import { Request, Response } from 'express';
import Spoc from '../models/Spoc';
import User from '../models/User';
import Paper from '../models/Paper';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createSpoc = asyncHandler(async (req: Request, res: Response) => {
  const { userId, department, accessLevel } = req.body;

  if (!userId || !department) {
    return res.status(400).json({ message: 'User ID and department are required' });
  }

  // Check if user exists and is a SPOC
  const user = await User.findById(userId);
  if (!user || user.role !== 'spoc') {
    return res.status(400).json({ message: 'Invalid user or user is not a SPOC' });
  }

  // Check if SPOC profile already exists
  const existingSpoc = await Spoc.findOne({ userId });
  if (existingSpoc) {
    return res.status(400).json({ message: 'SPOC profile already exists' });
  }

  const spoc = await Spoc.create({
    userId,
    department,
    accessLevel: accessLevel || 'department'
  });

  const populatedSpoc = await Spoc.findById(spoc._id)
    .populate('userId', 'name email');

  res.status(201).json({
    message: 'SPOC profile created successfully',
    spoc: populatedSpoc
  });
});

export const getAllSpocs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, department } = req.query;

  let filter: any = { isActive: true };
  if (department) {
    filter.department = department;
  }

  const spocs = await Spoc.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Spoc.countDocuments(filter);

  res.json({
    spocs,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

export const getSpocById = asyncHandler(async (req: Request, res: Response) => {
  const spoc = await Spoc.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('managedStudents', 'name email rollNo');

  if (!spoc) {
    return res.status(404).json({ message: 'SPOC not found' });
  }

  res.json({ spoc });
});

export const updateSpoc = asyncHandler(async (req: Request, res: Response) => {
  const { department, accessLevel, isActive } = req.body;

  const spoc = await Spoc.findByIdAndUpdate(
    req.params.id,
    { department, accessLevel, isActive },
    { new: true, runValidators: true }
  ).populate('userId', 'name email');

  if (!spoc) {
    return res.status(404).json({ message: 'SPOC not found' });
  }

  res.json({
    message: 'SPOC updated successfully',
    spoc
  });
});

export const getSpocStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  
  const spoc = await Spoc.findById(req.params.id);
  if (!spoc) {
    return res.status(404).json({ message: 'SPOC not found' });
  }

  const students = await User.find({
    _id: { $in: spoc.managedStudents },
    role: 'student',
    isActive: true
  })
    .select('-password')
    .sort({ name: 1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = spoc.managedStudents.length;

  res.json({
    students,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

export const addStudentToSpoc = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.body;
  const spocId = req.params.id;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  // Check if student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Check if SPOC exists
  const spoc = await Spoc.findById(spocId);
  if (!spoc) {
    return res.status(404).json({ message: 'SPOC not found' });
  }

  // Add student to SPOC's managed students
  await Spoc.findByIdAndUpdate(spocId, {
    $addToSet: { managedStudents: studentId }
  });

  res.json({ message: 'Student added to SPOC successfully' });
});

export const removeStudentFromSpoc = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const spocId = req.params.id;

  // Remove student from SPOC's managed students
  await Spoc.findByIdAndUpdate(spocId, {
    $pull: { managedStudents: studentId }
  });

  res.json({ message: 'Student removed from SPOC successfully' });
});

export const getSpocReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const spocId = req.params.id;
  const { startDate, endDate, subject } = req.query;

  const spoc = await Spoc.findById(spocId);
  if (!spoc) {
    return res.status(404).json({ message: 'SPOC not found' });
  }

  // Build filter for papers
  let paperFilter: any = {
    studentId: { $in: spoc.managedStudents }
  };

  if (startDate || endDate) {
    paperFilter.examDate = {};
    if (startDate) paperFilter.examDate.$gte = new Date(startDate as string);
    if (endDate) paperFilter.examDate.$lte = new Date(endDate as string);
  }

  if (subject) {
    paperFilter.subject = subject;
  }

  // Get papers for managed students
  const papers = await Paper.find(paperFilter)
    .populate('studentId', 'name rollNo')
    .sort({ examDate: -1 });

  // Generate statistics
  const stats: {
    totalPapers: number;
    totalStudents: number;
    papersByStatus: { [key: string]: number };
    papersBySubject: { [key: string]: number };
    averageScore: number;
    gradesDistribution: { [key: string]: number };
  } = {
    totalPapers: papers.length,
    totalStudents: spoc.managedStudents.length,
    papersByStatus: {},
    papersBySubject: {},
    averageScore: 0,
    gradesDistribution: {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D': 0, 'F': 0
    }
  };

  // Calculate statistics
  let totalScore = 0;
  let gradedPapers = 0;

  papers.forEach(paper => {
    // Status distribution
    stats.papersByStatus[paper.status] = (stats.papersByStatus[paper.status] || 0) + 1;
    
    // Subject distribution
    stats.papersBySubject[paper.subject] = (stats.papersBySubject[paper.subject] || 0) + 1;
    
    // Grade calculation
    if (paper.finalGrade?.score !== undefined) {
      totalScore += paper.finalGrade.score;
      gradedPapers++;
      
      const percentage = (paper.finalGrade.score / paper.maxMarks) * 100;
      const grade = calculateGrade(percentage);
      stats.gradesDistribution[grade]++;
    }
  });

  if (gradedPapers > 0) {
    stats.averageScore = Math.round((totalScore / gradedPapers) * 100) / 100;
  }

  res.json({
    spoc: {
      id: spoc._id,
      department: spoc.department,
      accessLevel: spoc.accessLevel
    },
    stats,
    papers: papers.slice(0, 20) // Return only recent 20 papers
  });
});

const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
};