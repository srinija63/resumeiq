import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { reviewResume } from './api/review';

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'dev-api-review',
        configureServer(server) {
          server.middlewares.use('/api/review', (req, res, next) => {
            if (req.method !== 'POST') {
              sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
              return;
            }

            readJsonBody(req)
              .then(async (payload) => {
                const { resumeText } = (payload ?? {}) as { resumeText?: unknown };
                const result = await reviewResume(resumeText, env.GEMINI_API_KEY);
                sendJson(res, result.status, result.body);
              })
              .catch(() => {
                sendJson(res, 400, { error: 'Invalid request body.' });
              });
          });
        },
      },
    ],
  };
});
