# ioBroker.open-wa

Minimal ioBroker adapter to send WhatsApp messages via an open-wa gateway.

## Usage (Blockly)
1. Set `open-wa.0.send.to` to `+49...` or already to a chat id like `4917...@c.us` / group id `...@g.us`
2. Write your message to `open-wa.0.send.text`

The adapter converts phone numbers like `+491726361044` to `491726361044@c.us` automatically and sends:

```json
{
  "args": { "to": "491726361044@c.us", "content": "Hello" }
}
```
