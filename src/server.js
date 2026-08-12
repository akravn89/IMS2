import http from 'node:http';
import crypto from 'node:crypto';
import { URL } from 'node:url';
import { respondToMessage, checkIn } from './app.js';

const port = Number(process.env.PORT || 3000);
const maxBodyBytes = 1024 * 1024;

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(data),
    'cache-control': 'no-store'
  });
  res.end(data);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error('BODY_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function verifyMetaSignature(raw, signatureHeader) {
  const secret = process.env.META_APP_SECRET;
  if (!secret) return true; // credential-free sample mode only
  if (!signatureHeader?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const actual = signatureHeader.slice('sha256='.length);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

function extractIncomingMessages(payload) {
  const messages = [];
  for (const entry of payload?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      for (const message of change?.value?.messages ?? []) {
        if (message?.from && message?.type === 'text' && message?.text?.body) {
          messages.push({ id: message.id, from: `+${String(message.from).replace(/^\+/, '')}`, text: message.text.body });
        }
      }
    }
  }
  return messages;
}

async function sendWhatsAppText(to, text) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION;

  if (!token || !phoneNumberId || !apiVersion) {
    console.log(JSON.stringify({ level: 'info', event: 'mock_whatsapp_send', to, text }));
    return { mock: true };
  }

  const response = await fetch(`https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/^\+/, ''),
      type: 'text',
      text: { body: text }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WHATSAPP_SEND_FAILED:${response.status}:${body.slice(0, 500)}`);
  }
  return response.json();
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return json(res, 200, { ok: true, mode: process.env.WHATSAPP_ACCESS_TOKEN ? 'whatsapp' : 'sample' });
      }

      if (req.method === 'GET' && url.pathname === '/webhook') {
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');
        if (mode === 'subscribe' && process.env.WHATSAPP_VERIFY_TOKEN && token === process.env.WHATSAPP_VERIFY_TOKEN) {
          res.writeHead(200, { 'content-type': 'text/plain' });
          return res.end(challenge ?? '');
        }
        return json(res, 403, { error: 'WEBHOOK_VERIFICATION_FAILED' });
      }

      if (req.method === 'POST' && url.pathname === '/webhook') {
        const raw = await readBody(req);
        if (!verifyMetaSignature(raw, req.headers['x-hub-signature-256'])) return json(res, 401, { error: 'INVALID_SIGNATURE' });
        const payload = JSON.parse(raw.toString('utf8') || '{}');
        const incoming = extractIncomingMessages(payload);
        for (const message of incoming) {
          const reply = respondToMessage(message.from, message.text);
          await sendWhatsAppText(message.from, reply.text);
        }
        return json(res, 200, { received: true, processed: incoming.length });
      }

      if (req.method === 'POST' && url.pathname === '/simulate/message') {
        const raw = await readBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        if (typeof body.phone !== 'string' || typeof body.text !== 'string') return json(res, 400, { error: 'phone and text are required strings' });
        return json(res, 200, respondToMessage(body.phone, body.text));
      }

      if (req.method === 'POST' && url.pathname === '/simulate/checkin') {
        const raw = await readBody(req);
        const body = JSON.parse(raw.toString('utf8') || '{}');
        if (typeof body.attendeeId !== 'string' || typeof body.boothId !== 'string') return json(res, 400, { error: 'attendeeId and boothId are required strings' });
        const result = checkIn(body.attendeeId, body.boothId.toUpperCase());
        return json(res, result.ok ? 200 : 404, result);
      }

      return json(res, 404, { error: 'NOT_FOUND' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      console.error(JSON.stringify({ level: 'error', event: 'request_failed', message }));
      if (!res.headersSent) return json(res, message === 'BODY_TOO_LARGE' ? 413 : 500, { error: 'INTERNAL_ERROR' });
      res.end();
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(port, () => {
    console.log(`WhatsApp Event Agent sample server listening on http://localhost:${port}`);
  });
}
