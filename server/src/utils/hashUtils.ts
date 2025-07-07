import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// utils/tokenUtils.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/roleConstants';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET as jwt.Secret, {
    expiresIn: config.JWT_EXPIRATION as string,
    issuer: config.JWT_ISSUER as string
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_SECRET as jwt.Secret) as TokenPayload;
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET as jwt.Secret, {
    expiresIn: '7d',
    issuer: config.JWT_ISSUER as string
  } as jwt.SignOptions);
};