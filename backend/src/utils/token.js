import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'mawaeedy_token';

export const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export function cookieOptions() {
  const sameSite = env.cookieSameSite;
  return {
    httpOnly: true,
    secure: env.isProd || sameSite === 'none',
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export const setAuthCookie = (res, userId) => res.cookie(COOKIE_NAME, signToken(userId), cookieOptions());
export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
