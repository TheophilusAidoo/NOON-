/**
 * JWT token utilities - Access & Refresh tokens
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);
