import http from 'node:http';
import { URL } from 'node:url';
import { checkIn, routeMessage } from './agent.js';

const port = Number(process.env.PORT ?? 3000);

function json(res, statusCode, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, { ok: true, mode: process.env.APP_MODE ?? 'mock' });
    }

    if (req.method === 'POST' && url.pathname === '/api/mock/message') {
      const body = await readJson(req);
      const result = routeMessage({ phone: body.phone, text: body.text, action: body.action });
      return json(res, result.status, result.body);
    }

    if (req.method === 'POST' && url.pathname === '/api/mock/checkin') {
      const body = await readJson(req);
      if (typeof body.attendeeId !== 'string' || typeof body.boothId !== 'string') {
        return json(res, 400, { error: 'INVALID_INPUT' });
      }
      const result = checkIn(body.attendeeId, body.boothId);
      return json(res, result.ok ? 200 : 404, result);
    }

    // Placeholder verification endpoint for future Meta webhook integration.
    if (req.method === 'GET' && url.pathname === '/webhooks/whatsapp') {
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      if (verifyToken && mode === 'subscribe' && token === verifyToken && challenge) {
        res.writeHead(200, { 'content-type': 'text/plain' });
        return res.end(challenge);
      }
      return json(res, 403, { error: 'WEBHOOK_VERIFICATION_FAILED' });
    }

    if (req.method === 'POST' && url.pathname === '/webhooks/whatsapp') {
      // Intentionally disabled until Meta credentials + signature verification are configured.
      return json(res, 501, {
        error: 'WHATSAPP_NOT_CONFIGURED',
        message: 'Run in mock mode until Meta credentials are added.',
      });
    }

    return json(res, 404, { error: 'NOT_FOUND' });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_JSON') {
      return json(res, 400, { error: 'INVALID_JSON' });
    }
    console.error('request_failed', { message: error instanceof Error ? error.message : String(error) });
    return json(res, 500, { error: 'INTERNAL_ERROR' });
  }
});

server.listen(port, () => {
  console.log(JSON.stringify({ event: 'server_started', port, mode: process.env.APP_MODE ?? 'mock' }));
});
