import { Request, Response } from 'express';
import Subject from '../models/Subject';
import User from '../models/User';
import { asyncHandler } from '../middlewares/errorHandler';

// Create subject
export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const { name, adminIds, spocIds } = req.body;
  if (!name || !adminIds || !Array.isArray(adminIds)) {
    return res.status(400).json({ message: 'Name and at least one admin required' });
  }
  const subject = await Subject.create({ name, adminIds, spocs: spocIds || [] });
  res.status(201).json({ message: 'Subject created', subject });
});

// Assign SPOCs to subject
export const assignSpocs = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const { spocIds } = req.body;
  if (!spocIds || !Array.isArray(spocIds)) {
    return res.status(400).json({ message: 'spocIds must be an array' });
  }
  const subject = await Subject.findByIdAndUpdate(subjectId, { $addToSet: { spocs: { $each: spocIds } } }, { new: true });
  res.json({ message: 'SPOCs assigned', subject });
});

// Assign Admins to subject
export const assignAdmins = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId } = req.params;
  const { adminIds } = req.body;
  if (!adminIds || !Array.isArray(adminIds)) {
    return res.status(400).json({ message: 'adminIds must be an array' });
  }
  const subject = await Subject.findByIdAndUpdate(subjectId, { $addToSet: { adminIds: { $each: adminIds } } }, { new: true });
  res.json({ message: 'Admins assigned', subject });
});

// Get all subjects
export const getAllSubjects = asyncHandler(async (req: Request, res: Response) => {
  const subjects = await Subject.find().populate('adminIds', 'name email').populate('spocs', 'name email');
  res.json({ subjects });
});
