import { describe, expect, it } from 'vitest';
import { calculatorTool } from './calculatorTool.js';

describe('calculatorTool', () => {
  it('evaluates a valid math expression', async () => {
    const result = await calculatorTool.invoke({ expression: '2 * 3 + 5' });
    expect(JSON.parse(String(result))).toMatchObject({ ok: true, result: 11 });
  });

  it('rejects invalid expressions', async () => {
    const result = await calculatorTool.invoke({ expression: 'bad input' });
    expect(JSON.parse(String(result)).ok).toBe(false);
  });
});
