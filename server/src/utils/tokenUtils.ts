import jwt from 'jsonwebtoken';

export function generateToken(
  payload: object,
  secret: jwt.Secret = process.env.JWT_SECRET || 'your_jwt_secret',
  expiresIn: string | number = '1h'
) {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}
