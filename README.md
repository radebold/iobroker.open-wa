# ioBroker.open-wa

Adapter to send WhatsApp messages via an open-wa gateway.

## Custom Blockly block
This adapter ships a Blockly block. After installing/updating the adapter, restart the **javascript** adapter once so Blockly detects the custom blocks.

You should then find a block under **Sendto** named **Open-WA**.

## Payload
```json
{
  "args": { "to": "491726361044@c.us", "content": "Hello" }
}
```
