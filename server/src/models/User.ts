import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  name: string;
  rollNo?: string;
  section?: string;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true, enum: ['admin', 'teacher', 'student', 'spoc'] },
  rollNo: { type: String, sparse: true, unique: true },
  name: { type: String, required: true, trim: true },
  section: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ rollNo: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
