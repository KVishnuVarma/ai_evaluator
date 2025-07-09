import express from 'express';
import {
  createSpoc,
  getAllSpocs,
  getSpocById,
  updateSpoc,
  getSpocStudents,
  addStudentToSpoc,
  removeStudentFromSpoc,
  getSpocReports,
  createSpocFull
} from '../controllers/spocController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Create SPOC profile - only admin
router.post('/', requireRole([ROLES.ADMIN]), createSpoc);

// New: Create both User and Spoc in one endpoint
router.post('/full', requireRole([ROLES.ADMIN]), createSpocFull);

// Get all SPOCs
router.get('/', requireRole([ROLES.ADMIN]), getAllSpocs);

// Get specific SPOC
router.get('/:id', requireRole([ROLES.ADMIN, ROLES.SPOC]), getSpocById);

// Update SPOC
router.put('/:id', requireRole([ROLES.ADMIN]), updateSpoc);

// SPOC student management
router.get('/:id/students', requireRole([ROLES.ADMIN, ROLES.SPOC]), getSpocStudents);
router.post('/:id/students', requireRole([ROLES.ADMIN, ROLES.SPOC]), addStudentToSpoc);
router.delete('/:id/students/:studentId', requireRole([ROLES.ADMIN, ROLES.SPOC]), removeStudentFromSpoc);

// SPOC reports
router.get('/:id/reports', requireRole([ROLES.ADMIN, ROLES.SPOC]), getSpocReports);

export default router;