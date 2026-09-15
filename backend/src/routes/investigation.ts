import { Router } from 'express';
import { z } from 'zod';
import { runInvestigation } from '../agents/graph.js';
import { getInvestigationById, getInvestigationsForUser, saveInvestigation } from '../services/firebase.js';

const router = Router();

const investigateSchema = z.object({
  question: z.string().min(8).max(1000),
  userId: z.string().min(1).optional(),
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/investigations', async (req, res) => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const items = await getInvestigationsForUser(userId);
    res.json(items);
  } catch (error) {
    console.error('Failed to fetch investigations', error);
    res.status(500).json({ error: 'Investigation history unavailable' });
  }
});

router.get('/investigations/:id', async (req, res) => {
  try {
    const item = await getInvestigationById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Investigation not found' });
    }
    return res.json(item);
  } catch (error) {
    console.error('Failed to fetch investigation', error);
    return res.status(500).json({ error: 'Investigation detail unavailable' });
  }
});

router.post('/investigate', async (req, res) => {
  try {
    const parsed = investigateSchema.parse(req.body ?? {});
    const investigation = await runInvestigation(parsed.question);

    const saved = await saveInvestigation({
      userId: parsed.userId ?? 'anonymous',
      question: parsed.question,
      interpretedProblem: investigation.interpretedProblem,
      hypotheses: investigation.hypotheses,
      selectedHypothesis: investigation.selectedHypothesis,
      experiment: investigation.experiment,
      experimentResult: investigation.experimentResult,
      analysis: investigation.analysis,
      confidence: investigation.confidence,
      iteration: investigation.iteration,
      finalConclusion: investigation.finalConclusion,
      status: investigation.status,
      events: investigation.events,
      updatedAt: new Date().toISOString(),
    });

    const response = {
      ...investigation,
      firebase: saved,
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request payload', details: error.flatten() });
    }

    console.error('Investigation failed', error);
    return res.status(500).json({ error: 'Investigation failed', details: 'Please try again.' });
  }
});

export default router;
