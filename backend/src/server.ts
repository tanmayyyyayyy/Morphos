import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pathToFileURL } from 'node:url';
import investigationRouter from './routes/investigation.js';
import { config } from './config.js';

const app = express();

// Trust reverse proxy (e.g. Render, Cloud Run, Heroku) for express-rate-limit and client IP resolution
app.set('trust proxy', 1);

const isTest = process.env.NODE_ENV === 'test';

// ── Security Headers via Helmet ──────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // API server does not render HTML
  })
);

// ── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = [
  config.frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Request Body Size Limits (Abuse Protection) ──────────────────────────────
app.use(express.json({ limit: '100kb' }));

// ── Rate Limiting (Abuse & DoS Protection) ───────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 300, // Limit each IP to 300 requests per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
});

const investigateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 30, // Limit each IP to 30 AI investigations per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Investigation rate limit exceeded. Please wait a few minutes before starting another investigation.' },
});

app.use('/api', apiLimiter);
app.use('/api/investigate', investigateLimiter);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', investigationRouter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ name: 'MORPHOS API', status: 'online' });
});

// ── 404 Fallback for unknown API routes ───────────────────────────────────────
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Centralized Error Handler (No sensitive leak / stack trace) ──────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err && typeof err === 'object' && ('type' in err && (err as { type: string }).type === 'entity.too.large')) {
    return res.status(413).json({ error: 'Request payload exceeds size limit (100kb maximum).' });
  }
  console.error('Unhandled Server Error:', err);
  return res.status(500).json({ error: 'Internal server error. Please try again later.' });
});

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  app.listen(config.port, () => {
    console.log(`MORPHOS backend listening on http://localhost:${config.port}`);
  });
}

export default app;

