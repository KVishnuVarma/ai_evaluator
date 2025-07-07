import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import { asyncHandler } from '../middlewares/errorHandler';

// Create ticket
export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId, question } = req.body;
  const userId = (req as any).user._id;
  if (!subjectId || !question) {
    return res.status(400).json({ message: 'Subject and question required' });
  }
  const ticket = await Ticket.create({ userId, subjectId, question });
  res.status(201).json({ message: 'Ticket created', ticket });
});

// Get all tickets (admin/spoc)
export const getAllTickets = asyncHandler(async (req: Request, res: Response) => {
  const tickets = await Ticket.find().populate('userId', 'name email').populate('subjectId', 'name');
  res.json({ tickets });
});

// Get my tickets (student)
export const getMyTickets = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const tickets = await Ticket.find({ userId }).populate('subjectId', 'name');
  res.json({ tickets });
});

// Update ticket (spoc/admin response)
export const respondTicket = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { response, status } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(ticketId, { response, status }, { new: true });
  res.json({ message: 'Ticket updated', ticket });
});
