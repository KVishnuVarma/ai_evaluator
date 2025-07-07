import express from 'express';
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  assignPaper
} from '../controllers/teacherController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Create teacher profile - only admin
router.post('/', requireRole([ROLES.ADMIN]), createTeacher);

// Get all teachers
router.get('/', requireRole([ROLES.ADMIN, ROLES.SPOC]), getAllTeachers);

// Get specific teacher
router.get('/:id', requireRole([ROLES.ADMIN, ROLES.SPOC, ROLES.TEACHER]), getTeacherById);

// Update teacher
router.put('/:id', requireRole([ROLES.ADMIN]), updateTeacher);

// Assign paper to teacher
router.post('/:id/assign-paper', requireRole([ROLES.ADMIN, ROLES.SPOC]), assignPaper);

export default router;