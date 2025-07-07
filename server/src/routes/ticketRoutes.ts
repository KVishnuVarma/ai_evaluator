import express from 'express';
import { createTicket, getAllTickets, getMyTickets, respondTicket } from '../controllers/ticketController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../config/roleConstants';

const router = express.Router();

router.use(authenticateToken);

router.post('/', requireRole([ROLES.STUDENT]), createTicket);
router.get('/my', requireRole([ROLES.STUDENT]), getMyTickets);
router.get('/', requireRole([ROLES.ADMIN, ROLES.SPOC]), getAllTickets);
router.put('/:ticketId/respond', requireRole([ROLES.ADMIN, ROLES.SPOC]), respondTicket);

export default router;
