import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  adminIds: string[]; // UserIds of subject admins
  spocs: string[]; // UserIds of assigned SPOCs
}

const subjectSchema = new Schema<ISubject>({
  name: { type: String, required: true, unique: true },
  adminIds: [{ type: String, required: true, ref: 'User' }],
  spocs: [{ type: String, ref: 'User' }]
});

subjectSchema.index({ name: 1 });

export default mongoose.model<ISubject>('Subject', subjectSchema);
