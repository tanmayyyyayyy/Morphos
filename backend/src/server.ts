import express from 'express';
import cors from 'cors';
import { pathToFileURL } from 'node:url';
import investigationRouter from './routes/investigation.js';
import { config } from './config.js';

const app = express();

app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', investigationRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'MORPHOS API', status: 'online' });
});

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  app.listen(config.port, () => {
    console.log(`MORPHOS backend listening on http://localhost:${config.port}`);
  });
}

export default app;
