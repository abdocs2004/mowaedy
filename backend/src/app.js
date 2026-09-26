import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { sanitizeBody } from './middleware/security.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.isProd) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Non-browser clients (curl, server-to-server) send no Origin header.
        if (!origin || env.clientUrls.includes(origin)) return cb(null, true);
        return cb(new Error('CORS: origin not allowed'));
      },
      credentials: true,
    })
  );
  app.use(compression());
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(sanitizeBody);

  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.nodeEnv === 'test' ? 10000 : 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { success: false, code: 'RATE_LIMITED', message: 'طلبات كثيرة، يرجى المحاولة بعد قليل' },
    })
  );
  app.use('/api', routes);

  // Single-server deployment: serve the built React app (frontend/dist) and fall back to index.html.
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
  if (env.serveClient && fs.existsSync(dist)) {
    app.use(express.static(dist, { maxAge: env.isProd ? '7d' : 0, index: false }));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
