import express from 'express';
import {
  uploadPaper,
  getAllPapers,
  getPaperById,
  updatePaperStatus,
  downloadPaper,
  getStudentResults
} from '../controllers/paperController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole, requirePermission } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

// Public route for student results (only requires roll number)
router.get('/results/:rollNo', getStudentResults);

// Protect all other routes
router.use(authenticateToken);

// Upload papers - only admin and SPOC
router.post('/upload', requireRole([ROLES.ADMIN, ROLES.SPOC]), uploadPaper);

// Get all papers - role-based filtering applied in controller
router.get('/', getAllPapers);

// Get specific paper
router.get('/:id', getPaperById);

// Update paper status
router.put('/:id/status', updatePaperStatus);

// Download paper
router.get('/:id/download', downloadPaper);

export default router;
