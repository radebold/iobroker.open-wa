# ioBroker.open-wa

Send WhatsApp messages and images via an **open-wa** gateway.

## Config
Set gateway IP and port in adapter settings.

## Blockly
After updating:
- `iobroker upload open-wa`
- restart `javascript.0`
- reload Blockly (Ctrl+F5)

### Text
Uses: `sendTo("open-wa.X", "send", { to: "+49...", content: "..." })`

### Image
Uses: `sendTo("open-wa.X", "sendImage", { to, file, filename, caption })`

`to` is converted automatically from `+4917...` to `4917...@c.us`.
