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

// Upload Paper
export const uploadPaper = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { rollNo, subject, examDate, maxMarks, title, rubric } = req.body;
  const questionPaper = (req as any).files?.questionPaper;
  const answerSheet = (req as any).files?.answerSheet;

  if (!questionPaper || !answerSheet) {
    return res.status(400).json({ message: 'Both question paper and answer sheet files are required' });
  }
  if (!rollNo || !subject || !examDate || !maxMarks || !title) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate file types
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff'];
  const qpExt = path.extname(questionPaper.name).toLowerCase();
  const asExt = path.extname(answerSheet.name).toLowerCase();
  if (!allowedTypes.includes(qpExt) || !allowedTypes.includes(asExt)) {
    return res.status(400).json({ message: 'Invalid file type' });
  }

  // Find student by roll number
  const student = await User.findOne({ rollNo, role: 'student', isActive: true });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Generate unique filenames
  const uploadDir = path.join(__dirname, '../uploads/papers');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const qpFileName = generateFileName(questionPaper.name, 'question');
  const asFileName = generateFileName(answerSheet.name, 'answer');
  const qpPath = path.join(uploadDir, qpFileName);
  const asPath = path.join(uploadDir, asFileName);
  await questionPaper.mv(qpPath);
  await answerSheet.mv(asPath);

  // Create paper record
  const paper = await Paper.create({
    studentId: student._id,
    rollNo,
    name: student.name,
    section: student.section,
    title,
    questionPaper: qpPath,
    answerPaper: asPath,
    originalFileName: questionPaper.name + '|' + answerSheet.name,
    subject,
    examDate: new Date(examDate),
    maxMarks: Number(maxMarks),
    submittedBy: req.user!._id,
    status: 'uploaded',
    rubric: rubric || '',
  });

  // Start OCR and AI grading
  processOCRAndGrading(paper._id, qpPath, asPath, rubric, Number(maxMarks), subject);

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

// OCR and AI Grading
const processOCRAndGrading = async (
  paperId: string,
  qpPath: string,
  asPath: string,
  rubric: any,
  maxMarks: number,
  subject: string
) => {
  try {
    // OCR both files
    const questionOcr = await OCRService.processFile(qpPath);
    const answerOcr = await OCRService.processFile(asPath);

    // Parse rubric if string
    let rubricObj = {};
    if (typeof rubric === 'string') {
      try {
        rubricObj = JSON.parse(rubric);
      } catch {
        rubricObj = {};
      }
    } else if (typeof rubric === 'object' && rubric !== null) {
      rubricObj = rubric;
    }

    // AI grading: combine questions and answers into a single string
    const combinedText = `Questions:\n${questionOcr.text}\n\nAnswers:\n${answerOcr.text}`;
    const gradingResult = await GradingService.gradeWithAI(
      combinedText,
      {
        subject: subject || '',
        maxMarks,
        rubric: rubricObj
      }
    );

    // Save report (no details field)
    await Paper.findByIdAndUpdate(paperId, {
      ocrText: { questions: questionOcr.text, answers: answerOcr.text },
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
    await Paper.findByIdAndUpdate(paperId, { status: 'uploaded' }, { new: true });
  }
};

// Get all papers
export const getAllPapers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, subject, page = 1, limit = 10, rollNo } = req.query;
  const user = req.user!;

  let filter: any = {};

  // Role-based filtering
  if (user.role === 'student') {
    filter.studentId = user._id;
  } else if (user.role === 'teacher') {
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

// Get paper by ID
export const getPaperById = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findById(req.params.id)
    .populate('studentId', 'name rollNo email');

  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  res.json({ paper });
});

// Update paper status
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

// Download paper
export const downloadPaper = asyncHandler(async (req: Request, res: Response) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: 'Paper not found' });
  }

  // Use answerPaper or questionPaper as needed
  const filePath = paper.answerPaper || paper.questionPaper;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Paper file not found' });
  }

  res.download(filePath, paper.originalFileName);
});

// Get student results
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