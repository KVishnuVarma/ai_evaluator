import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  _id: string;
  userId: string;
  employeeId: string;
  subjects: string[];
  assignedPapers: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  assignedPapers: [{
    type: String,
    ref: 'Paper'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

teacherSchema.index({ userId: 1 });
teacherSchema.index({ employeeId: 1 });
teacherSchema.index({ subjects: 1 });

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
