import crypto from 'crypto'

interface TokenResult {
  token: string
  hashedToken: string
  expires: Date
}

// For email verification (24 hours)
export function generateVerifyToken(): TokenResult {
  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return { token, hashedToken, expires }
}

// For password reset (1 hour)
export function generateResetToken(): TokenResult {
  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000)
  return { token, hashedToken, expires }
}

// Hash any token (for verification)
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}