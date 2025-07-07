import express from 'express';
import { createSubject, assignSpocs, assignAdmins, getAllSubjects } from '../controllers/subjectController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

router.use(authenticateToken);

router.post('/', requireRole([ROLES.ADMIN]), createSubject);
router.post('/:subjectId/assign-spocs', requireRole([ROLES.ADMIN]), assignSpocs);
router.post('/:subjectId/assign-admins', requireRole([ROLES.ADMIN]), assignAdmins);
router.get('/', getAllSubjects);

export default router;
