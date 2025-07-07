import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { RoleType, hasPermission, isValidRole } from '../config/roleConstants';

export const requireRole = (allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const role = req.user.role;
    if (!isValidRole(role)) {
      res.status(403).json({ 
        message: 'Invalid role',
        required: allowedRoles,
        current: role
      });
      return;
    }
    if (!allowedRoles.includes(role as RoleType)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: role
      });
      return;
    }
    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const role = req.user.role;
    if (!isValidRole(role)) {
      res.status(403).json({ 
        message: 'Invalid role',
        required: permission,
        role: role
      });
      return;
    }
    if (!hasPermission(role as RoleType, permission)) {
      res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        role: role
      });
      return;
    }
    next();
  };
};