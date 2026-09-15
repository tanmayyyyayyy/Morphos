import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../server.js';

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      verifyIdToken: async (token: string) => {
        if (token !== 'test-firebase-token') {
          throw new Error('Invalid token');
        }

        return { uid: 'test-user-uid' };
      },
    }),
  },
}));

describe('API', () => {
  it('returns health ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('runs an investigation request', async () => {
    const response = await request(app)
      .post('/api/investigate')
      .set('Authorization', 'Bearer test-firebase-token')
      .send({
        question: 'Why is API latency increasing?',
      });

    expect(response.status).toBe(200);
    expect(response.body.question).toBe('Why is API latency increasing?');
    expect(response.body.finalConclusion).toBeTruthy();
  });
});
