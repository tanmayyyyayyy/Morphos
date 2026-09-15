import { Router } from 'express';
import { z } from 'zod';
import { runInvestigation } from '../agents/graph.js';
import { saveInvestigation } from '../services/firebase.js';

const router = Router();

const investigateSchema = z.object({
  question: z.string().min(8).max(1000),
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/investigate', async (req, res) => {
  try {
    const parsed = investigateSchema.parse(req.body ?? {});
    const investigation = await runInvestigation(parsed.question);

    await saveInvestigation({
      question: parsed.question,
      interpretedProblem: investigation.interpretedProblem,
      hypotheses: investigation.hypotheses,
      experiment: investigation.experiment,
      analysis: investigation.analysis,
      confidence: investigation.confidence,
      finalConclusion: investigation.finalConclusion,
      status: investigation.status,
      events: investigation.events,
      createdAt: new Date().toISOString(),
    });

    res.json(investigation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request payload', details: error.flatten() });
    }

    console.error('Investigation failed', error);
    return res.status(500).json({ error: 'Investigation failed', details: 'Please try again.' });
  }
});

export default router;
