import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pathToFileURL } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import investigationRouter from './routes/investigation.js';
import { config } from './config.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isConfiguredOrigin = origin === config.frontendOrigin
      && (!isProduction || config.frontendOrigin.startsWith('https://'));
    const isLocalDevelopmentOrigin = !isProduction && origin === 'http://localhost:5173';
    callback(null, Boolean(origin && (isConfiguredOrigin || isLocalDevelopmentOrigin)));
  },
  credentials: true,
}));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json({ limit: '100kb' }));
app.use('/api', investigationRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'MORPHOS API', status: 'online' });
});

app.use((_error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: 'Internal server error.' });
});

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`MORPHOS backend listening on port ${config.port}`);
  });
}

export default app;
