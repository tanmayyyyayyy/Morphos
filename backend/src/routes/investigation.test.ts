import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('API', () => {
  it('returns health ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('runs an investigation request', async () => {
    const response = await request(app).post('/api/investigate').send({
      question: 'Why is API latency increasing?',
    });

    expect(response.status).toBe(200);
    expect(response.body.question).toBe('Why is API latency increasing?');
    expect(response.body.finalConclusion).toBeTruthy();
  });
});
