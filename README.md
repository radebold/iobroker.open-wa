# ioBroker.open-wa (v0.3.4)

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

Notes:
- phone numbers are normalized automatically
- group JIDs like `...@g.us` are preserved
- Admin UI includes a direct test tab
- adapter supports `send` and `test` commands

## Blockly
Sendto blocks:
- Open-WA
- Open-WA (result) -> stores callback JSON into a state id you provide
