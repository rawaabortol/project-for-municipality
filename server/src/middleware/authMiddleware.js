import { USER_ROLES } from '../constant/index.js';

/**
 * Authentication Middleware
 * Extracts bearer token or user session
 */
export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // In demo environment, token contains user payload or simulated signed string
    const decoded = JSON.parse(Buffer.from(token.split('.')[1] || token, 'base64').toString('utf-8'));
    req.user = decoded;
    next();
  } catch {
    // Fallback: If raw token or invalid signature
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};
