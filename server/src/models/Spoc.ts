import mongoose, { Document, Schema } from 'mongoose';

export interface ISpoc extends Document {
  _id: string;
  userId: string;
  department: string;
  managedStudents: string[];
  accessLevel: 'department' | 'institution';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const spocSchema = new Schema<ISpoc>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  managedStudents: [{
    type: String,
    ref: 'User'
  }],
  accessLevel: {
    type: String,
    enum: ['department', 'institution'],
    default: 'department'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

spocSchema.index({ userId: 1 });
spocSchema.index({ department: 1 });

export default mongoose.model<ISpoc>('Spoc', spocSchema);
