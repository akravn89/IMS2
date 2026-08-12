# IMC WhatsApp AI Agent MVP

Credential-free starter for the event WhatsApp AI journey. It runs locally in `mock` mode today and keeps explicit placeholders for Meta WhatsApp Cloud API and OpenAI/RAG integration later.

## Included

- Sample IMC 2026 event
- 5 sample attendees
- 12 zones and 12 booths
- Personalized welcome/menu
- Sample event Q&A with grounded fallback
- Booth check-ins with duplicate protection
- Points and reward eligibility
- Mock HTTP endpoints
- Meta webhook verification placeholder
- Unit tests

## Requirements

- Node.js 22+

No npm dependencies are required for the mock MVP.

## Run

```bash
cp .env.example .env
npm test
npm start
```

Health check:

```bash
curl http://localhost:3000/health
```

Personalized welcome:

```bash
curl -X POST http://localhost:3000/api/mock/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","action":"welcome"}'
```

Ask a booth question:

```bash
curl -X POST http://localhost:3000/api/mock/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","text":"Where is AI Gallery?"}'
```

Check in:

```bash
curl -X POST http://localhost:3000/api/mock/checkin \
  -H 'content-type: application/json' \
  -d '{"attendeeId":"IMC001","boothId":"B01"}'
```

Rewards:

```bash
curl -X POST http://localhost:3000/api/mock/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","action":"rewards"}'
```

## Sample users

| ID | Name | Phone |
|---|---|---|
| IMC001 | Priya Sharma | +919810000001 |
| IMC002 | Rahul Mehta | +919810000002 |
| IMC003 | Aisha Khan | +919810000003 |
| IMC004 | John Smith | +447700900004 |
| IMC005 | Sara Ahmed | +971500000005 |

## Later: real WhatsApp

Configure these only in your deployment secret store / local `.env`, never in Git:

```text
META_APP_SECRET
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN
```

Then replace the disabled POST `/webhooks/whatsapp` handler with:

1. Meta request signature verification.
2. Webhook event parsing and message-ID deduplication.
3. Mapping the inbound WhatsApp number to an attendee.
4. Calling the same domain functions used by mock mode.
5. Sending the response via the Meta Cloud API.

## Later: AI/RAG

Add `OPENAI_API_KEY` to the deployment secret store, ingest approved event material, and replace the sample `answerQuestion` lookup with retrieval over the approved event knowledge base. Keep reward/check-in writes deterministic rather than model-controlled.

## Security notes

- Do not commit `.env` or API credentials.
- Validate Meta webhook signatures before accepting production events.
- Make inbound message handling idempotent.
- Capture WhatsApp opt-in for attendees before proactive outreach.
- Keep points/check-ins auditable and deterministic.
