# ioBroker.open-wa (v0.3.5)

## Gateway contract (text)
Adapter sends:
POST http://<ip>:<port>/sendText
Headers:
- Content-Type: application/json
- Authorization: Bearer <token>

Body:
{
  "to": "491726361044" | "120363423544638119@g.us",
  "content": "Gateway läuft sauber 🚀"
}

`to` is normalized automatically from `+49...` to digits only for phone numbers. Existing WhatsApp JIDs like `@g.us` and `@c.us` are preserved.

## Admin UI
The adapter includes a test tab in the Admin UI. The test button sends the current recipient and message values to the backend via the `test` command.

## Blockly
Sendto blocks:
- Open-WA
- Open-WA (result) -> stores callback JSON into a state id you provide
