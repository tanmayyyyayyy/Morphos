import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      // Minimal safe evaluator for numeric expressions.
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      if (!sanitized || sanitized === '0') {
        return JSON.stringify({ ok: false, error: 'Empty expression' });
      }
      const result = Function(`"use strict"; return (${sanitized});`)();
      return JSON.stringify({ ok: true, result, expression });
    } catch (error) {
      return JSON.stringify({ ok: false, error: 'Unable to compute expression', details: String(error) });
    }
  },
  {
    name: 'calculator_tool',
    description: 'Safely evaluate numeric expressions for experiment calculations.',
    schema: z.object({
      expression: z.string().describe('A numeric math expression such as 2 * 3 + 5'),
    }),
  },
);
