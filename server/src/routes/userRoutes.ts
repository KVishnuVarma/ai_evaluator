import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

// Admin and SPOC can manage users
router.get('/', requireRole([ROLES.ADMIN, ROLES.SPOC]), getAllUsers);
router.get('/:id', requireRole([ROLES.ADMIN, ROLES.SPOC]), getUserById);
router.put('/:id', requireRole([ROLES.ADMIN, ROLES.SPOC]), updateUser);
router.delete('/:id', requireRole([ROLES.ADMIN]), deleteUser);
router.put('/:id/reset-password', requireRole([ROLES.ADMIN, ROLES.SPOC]), resetPassword);

export default router;