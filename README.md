# WhatsApp Event Agent MVP

Credential-free starter for the event WhatsApp assistant shown in the IMC mockups. It runs entirely with sample attendees, booths, sessions and deterministic event knowledge until Meta/OpenAI credentials are available.

## What works now

- Sample attendee recognition by WhatsApp phone number
- Personalized welcome/menu
- Booth and session lookup
- Deterministic grounded event Q&A (no model required)
- Booth check-ins with duplicate protection
- Points and 10-booth gift eligibility
- Meta webhook verification endpoint
- Meta webhook signature validation when `META_APP_SECRET` is configured
- Real WhatsApp send adapter that activates only when all required Meta variables are set
- Credential-free `/simulate/*` endpoints for local testing

## Runtime

Pinned to Node.js `22.23.2`.

```bash
node --version
npm test
npm start
```

Server: `http://localhost:3000`

## Try the sample bot

Health:

```bash
curl http://localhost:3000/health
```

Personalized message:

```bash
curl -X POST http://localhost:3000/simulate/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","text":"hi"}'
```

Ask for a booth:

```bash
curl -X POST http://localhost:3000/simulate/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","text":"Where is AI Gallery?"}'
```

Check in to a booth:

```bash
curl -X POST http://localhost:3000/simulate/checkin \
  -H 'content-type: application/json' \
  -d '{"attendeeId":"IMC001","boothId":"B01"}'
```

Check rewards by messaging `3`:

```bash
curl -X POST http://localhost:3000/simulate/message \
  -H 'content-type: application/json' \
  -d '{"phone":"+919810000001","text":"3"}'
```

## Sample attendees

| ID | Name | Phone |
|---|---|---|
| IMC001 | Priya Sharma | +919810000001 |
| IMC002 | Rahul Mehta | +919810000002 |
| IMC003 | Aisha Khan | +919810000003 |
| IMC004 | John Smith | +447700900004 |
| IMC005 | Sara Ahmed | +971500000005 |

## Configuration

Copy `.env.example` values into your deployment secret manager or shell environment when credentials become available. This project intentionally does **not** load `.env` files itself, keeping the runtime dependency-free.

Required for real WhatsApp mode:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_VERIFY_TOKEN`
- `META_APP_SECRET`

`OPENAI_API_KEY` is reserved for the next phase. Until then, unsupported questions return a safe “information not available” response instead of inventing an answer.

## API

- `GET /health`
- `GET /webhook` — Meta webhook verification
- `POST /webhook` — incoming WhatsApp messages
- `POST /simulate/message` — local chat simulator
- `POST /simulate/checkin` — local QR/check-in simulator

## Production upgrades

1. Replace in-memory sample data with PostgreSQL.
2. Import the real attendee CSV with explicit WhatsApp opt-in state.
3. Add signed QR tokens and a mobile check-in page.
4. Add approved event PDFs/FAQs/schedules to a RAG knowledge store.
5. Connect the Meta WhatsApp Business number.
6. Add approved outbound message templates.
7. Add queueing, webhook idempotency, audit logs, metrics and admin UI.

## Security notes

- Never commit Meta/OpenAI tokens.
- In sample mode webhook signatures are not required because there is no Meta secret; real mode should configure `META_APP_SECRET`.
- Add webhook message-ID deduplication before production traffic.
- Store attendee PII minimally and apply retention/deletion rules.
