import mongoose, { Document, Schema } from 'mongoose';

export interface IPaper extends Document {
  _id: string;
  studentId: string;
  rollNo: string;
  name: string;
  section?: string;
  title: string;
  filePath: string;
  originalFileName: string;
  status: 'uploaded' | 'ai_graded' | 'teacher_reviewing' | 'teacher_corrected' | 'final_graded' | 'released';
  aiGrade?: {
    score: number;
    feedback: string;
    gradedAt: Date;
    aiModel: string;
  };
  teacherReview?: {
    teacherId: string;
    corrections: string;
    reviewedAt: Date;
    status: 'approved' | 'needs_revision';
  };
  finalGrade?: {
    score: number;
    feedback: string;
    gradedBy: string;
    gradedAt: Date;
  };
  ocrText?: string;
  subject: string;
  examDate: Date;
  maxMarks: number;
  uploadedAt: Date;
  submittedBy: string; // Admin or SPOC who uploaded
  description: string;
  questionPaper: string;
  answerPaper: string;
  createdAt: Date;
  updatedAt: Date;
}

const paperSchema = new Schema<IPaper>({
  studentId: {
    type: String,
    required: true,
    ref: 'User'
  },
  rollNo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  section: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'ai_graded', 'teacher_reviewing', 'teacher_corrected', 'final_graded', 'released'],
    default: 'uploaded'
  },
  aiGrade: {
    score: Number,
    feedback: String,
    gradedAt: Date,
    aiModel: String
  },
  teacherReview: {
    teacherId: String,
    corrections: String,
    reviewedAt: Date,
    status: {
      type: String,
      enum: ['approved', 'needs_revision']
    }
  },
  finalGrade: {
    score: Number,
    feedback: String,
    gradedBy: String,
    gradedAt: Date
  },
  ocrText: String,
  subject: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  questionPaper: {
    type: String,
    required: true
  },
  answerPaper: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paperSchema.index({ studentId: 1 });
paperSchema.index({ rollNo: 1 });
paperSchema.index({ status: 1 });
paperSchema.index({ subject: 1 });
paperSchema.index({ examDate: 1 });

export default mongoose.model<IPaper>('Paper', paperSchema);
