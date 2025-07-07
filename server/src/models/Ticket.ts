import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  userId: string;
  subjectId: string;
  question: string;
  status: 'open' | 'in_progress' | 'resolved';
  spocId?: string;
  adminId?: string;
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  userId: { type: String, required: true, ref: 'User' },
  subjectId: { type: String, required: true, ref: 'Subject' },
  question: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  spocId: { type: String, ref: 'User' },
  adminId: { type: String, ref: 'User' },
  response: { type: String },
}, { timestamps: true });

ticketSchema.index({ userId: 1 });
ticketSchema.index({ subjectId: 1 });

ticketSchema.index({ status: 1 });

export default mongoose.model<ITicket>('Ticket', ticketSchema);
