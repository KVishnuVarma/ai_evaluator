import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Paper from '../models/Paper';
import User from '../models/User';
import Teacher from '../models/Teacher';
import { asyncHandler } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { generateFileName } from '../utils/generateFileName';
import { OCRService } from '../services/ocrService';
import { GradingService } from '../services/gradingService';

export const uploadPaper = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { rollNo, subject, examDate, maxMarks, title } = req.body;
  const file = (req as any).files?.paper;

  if (!file) {
    return res.status(400).json({ message: 'Paper file is required' });
  }

  if (!rollNo || !subject || !examDate || !maxMarks || !title) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate file type
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff'];
  const fileExtension = path.extname(file.name).toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    return res.status(400).json({ message: 'Invalid file type' });
  }

  // Find student by roll number
  const student = await User.findOne({ rollNo, role: 'student', isActive: true });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Generate unique filename
  const fileName = generateFileName(file.name, 'paper');
  const uploadDir = path.join(__dirname, '../uploads/papers');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);

  // Move file to upload directory
  await file.mv(filePath);

  // Create paper record
  const paper = await Paper.create({
    studentId: student._id,
    rollNo,
    title,
    filePath,
    originalFileName: file.name,
    subject,
    examDate: new Date(examDate),
    maxMarks: Number(maxMarks),
    submittedBy: req.user!._id,
    status: 'uploaded'
  });

  // Start OCR processing asynchronously
  processOCRAndGrading(paper._id);

  res.status(201).json({
    message: 'Paper uploaded successfully',
    paper: {
      id: paper._id,
      studentId: paper.studentId,
      rollNo: paper.rollNo,
      title: paper.title,
      subject: paper.subject,
      status: paper.status,
      uploadedAt: paper.uploadedAt
    }
  });
});

const processOCRAndGrading = async (paperId: string) => {
  try {
    const paper = await Paper.findById(paperId);
    if (!paper) return;

    // Extract text using OCR
    const ocrResult = await OCRService.processFile(paper.filePath);
    
    // Update paper with OCR text
    await Paper.findByIdAndUpdate(paperId, {
      ocrText: ocrResult.text
    });

    // Grade with AI
    const gradingResult = await GradingService.gradeWithAI(
      ocrResult.text,
      {
        subject: paper.subject,
        maxMarks: paper.maxMarks,
        rubric: {} // Add subject-specific rubric
      }
    );

    // Update paper with AI grading
    await Paper.findByIdAndUpdate(paperId, {
      aiGrade: {
        score: gradingResult.score,
        feedback: gradingResult.feedback,
        gradedAt: new Date(),
        aiModel: 'gpt-3.5-turbo'
      },
      status: 'ai_graded'
    });

  } catch (error) {
    console.error('OCR and grading processing error:', error);
    // Update status to indicate processing failed
    await Paper.findByIdAndUpdate(paperId, {
      status: 'uploaded' // Keep as uploaded for manual processing
    });
  }
};

export const getAllPapers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, subject, page = 1, limit = 10, rollNo } = req.query;
  const user = req.user!;

  let filter: any = {};

  // Role-based filtering
  if (user.role === 'student') {
    filter.studentId = user._id;
  } else if (user.role === 'teacher') {
    // Teachers see papers assigned to them or in their subjects
    filter.$or = [
      { 'teacherReview.teacherId': user._id },
      { subject: { $in: await getTeacherSubjects(String(user._id)) } }
    ];
  }

  // Additional filters
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  if (rollNo) filter.rollNo = rollNo;

  const papers = await Paper.find(filter)
    .populate('studentId', 'name rollNo email')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Paper.countDocuments(filter);

  res.json({
    papers,
    pagination: {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    }
  });
});

const getTeacherSubjects = async (teacherId: string): Promise<string[]> => {
  const teacher = await Teacher.findOne({ userId: String(teacherId) });
  return teacher?.subjects || [];
};

export const getPaperById = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findById(req.params.id)
    .populate('studentId', 'name rollNo email');

  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  res.json({ paper });
});

export const updatePaperStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, teacherReview, finalGrade } = req.body;
  const paperId = req.params.id;
  const user = req.user!;

  const paper = await Paper.findById(paperId);
  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  const updateData: any = { status };

  if (teacherReview && user.role === 'teacher') {
    updateData.teacherReview = {
      ...teacherReview,
      teacherId: user._id,
      reviewedAt: new Date()
    };
  }

  if (finalGrade && (user.role === 'teacher' || user.role === 'admin')) {
    updateData.finalGrade = {
      ...finalGrade,
      gradedBy: user._id,
      gradedAt: new Date()
    };
  }

  const updatedPaper = await Paper.findByIdAndUpdate(
    paperId,
    updateData,
    { new: true }
  ).populate('studentId', 'name rollNo email');

  res.json({
    message: 'Paper updated successfully',
    paper: updatedPaper
  });
});

export const downloadPaper = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  if (!fs.existsSync(paper.filePath)) {
    return res.status(404).json({ message: 'Paper file not found' });
  }

  res.download(paper.filePath, paper.originalFileName);
});

export const getStudentResults = asyncHandler(async (req: Request, res: Response) => {
  const { rollNo } = req.params;

  const papers = await Paper.find({
    rollNo,
    status: 'released'
  }).select('title subject examDate finalGrade aiGrade maxMarks');

  if (!papers.length) {
    return res.status(404).json({ message: 'No results found for this roll number' });
  }

  res.json({ papers });
});