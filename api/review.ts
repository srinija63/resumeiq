import type { VercelRequest, VercelResponse } from '@vercel/node';
import { reviewResume } from './_lib/reviewResume';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { resumeText } = (req.body ?? {}) as { resumeText?: unknown };
  const { status, body } = await reviewResume(resumeText, process.env.GEMINI_API_KEY);
  return res.status(status).json(body);
}
