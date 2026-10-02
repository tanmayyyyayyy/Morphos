import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pathToFileURL } from 'node:url';
import investigationRouter from './routes/investigation.js';
import { config } from './config.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isConfiguredOrigin = origin === config.frontendOrigin
      && (!isProduction || config.frontendOrigin.startsWith('https://'));
    const isLocalDevelopmentOrigin = !isProduction
      && ['http://localhost:5173', 'http://127.0.0.1:5173'].includes(origin);

    return callback(null, isConfiguredOrigin || isLocalDevelopmentOrigin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '100kb' }));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/investigate', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api', investigationRouter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ name: 'MORPHOS API', status: 'online' });
});

app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request payload exceeds size limit (100kb maximum).' });
  }
  console.error('Unhandled server error:', err);
  return res.status(500).json({ error: 'Internal server error.' });
});

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`MORPHOS backend listening on port ${config.port}`);
  });
}

export default app;
