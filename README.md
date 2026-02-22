# ioBroker.open-wa (v0.3.1)

## Gateway contract (text)
Adapter sends:
POST http://<ip>:<port>/send
Headers:
- Content-Type: application/json
- Authorization: Bearer <token>

Body:
{
  "to": "491726361044",
  "text": "Gateway läuft sauber 🚀"
}

`to` is normalized automatically from `+49...` to digits only.

## Blockly
Sendto blocks:
- Open-WA
- Open-WA (result) -> stores callback JSON into a state id you provide
