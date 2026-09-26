import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name} (see .env.example)`);
    process.exit(1);
  }
  return value;
}

const jwtSecret = required('JWT_SECRET');
if (isProd && jwtSecret.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

export const env = {
  isProd,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  serveClient: process.env.SERVE_CLIENT === 'true',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  timezone: process.env.TIMEZONE || 'Africa/Cairo',
  cancelWindowHours: Number(process.env.CANCEL_WINDOW_HOURS ?? 2),
  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'مدير المنصة',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@mawaeedy.local',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
};
