# ioBroker.open-wa

ioBroker adapter to talk to an open-wa WhatsApp gateway (Swagger UI visible at `/api-docs`).

## Config
- Server IP
- Server Port
- Base path (optional)
- API key (optional)
- Poll interval

## States
- `send.to` (string): recipient number
- `send.text` (string): write message text to send it to `send.to`
- `send.lastResult` (json string): last send response
- `send.lastError` (string): last send error
- `info.connection` (boolean): gateway reachable
- `status.lastCheck` (ISO string): last poll time

## Notes
This is a minimal starting point. If your gateway expects different payload keys than `{ phone, message }` or different endpoints, adjust `lib/api.js`.
