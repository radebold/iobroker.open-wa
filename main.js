'use strict';

const utils = require('@iobroker/adapter-core');
const OpenWaApi = require('./lib/api');

class OpenWa extends utils.Adapter {
  constructor(options = {}) {
    super({ ...options, name: 'open-wa' });

    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    this.on('message', this.onMessage.bind(this));
    this.on('unload', this.onUnload.bind(this));

    this.api = null;
  }

  async onReady() {
    await this.setObjectNotExistsAsync('send.to', {
      type: 'state',
      common: { name: 'Recipient (phone number or WhatsApp group JID)', type: 'string', role: 'text', read: true, write: true },
      native: {}
    });
    await this.setObjectNotExistsAsync('send.text', {
      type: 'state',
      common: { name: 'Message text (write to send)', type: 'string', role: 'text', read: true, write: true },
      native: {}
    });
    await this.setObjectNotExistsAsync('send.lastError', {
      type: 'state',
      common: { name: 'Last send error', type: 'string', role: 'text', read: true, write: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('send.lastResult', {
      type: 'state',
      common: { name: 'Last send result', type: 'string', role: 'json', read: true, write: false },
      native: {}
    });
    await this.setObjectNotExistsAsync('info.connection', {
      type: 'state',
      common: { name: 'Connection', type: 'boolean', role: 'indicator.connected', read: true, write: false },
      native: {}
    });

    this.subscribeStates('send.text');

    const ip = this.config.serverIp;
    const port = this.config.serverPort;
    const url = `http://${ip}:${port}`;

    this.log.info(`Using gateway: ${url}`);
    if (!String(this.config.token || '').trim()) {
      this.log.warn('No Bearer token configured (adapter config: token). Requests may be rejected.');
    }

    this.api = new OpenWaApi(url, this.config.token);
    await this.setStateAsync('info.connection', true, true);
    await this.setStateAsync('send.lastError', '', true);
    this.log.debug('Adapter ready. Commands supported: send, test');
  }

  async onUnload(callback) {
    try { callback(); } catch { callback(); }
  }

  maskRecipient(to) {
    const dest = String(to ?? '').trim();
    if (!dest) return '';
    if (dest.endsWith('@g.us')) return dest;
    if (dest.endsWith('@c.us')) return dest.replace(/^(\d{3})\d+(?=@c\.us$)/, '$1***');
    if (dest.startsWith('+')) return dest.replace(/^(\+\d{3})\d+$/, '$1***');
    return dest.replace(/^(\d{3})\d+$/, '$1***');
  }

  async _sendText(to, text, source = 'unknown') {
    const msg = String(text ?? '').trim();
    const dest = String(to ?? '').trim();
    if (!msg) throw new Error('Empty message');
    if (!dest) throw new Error('Recipient missing');

    const maskedDest = this.maskRecipient(dest);
    this.log.info(`Sending WhatsApp message (${source}) to: ${maskedDest}`);
    this.log.debug(`Outgoing payload (${source}): ${JSON.stringify({ to: dest, text: msg })}`);

    const res = await this.api.sendText(dest, msg);
    const data = res?.data ?? res;

    this.log.debug(`Gateway response (${source}): ${JSON.stringify(data)}`);

    if (data && data.success === false) {
      const responseText = typeof data.response !== 'undefined' ? String(data.response) : '';
      const errorText = typeof data.error !== 'undefined' ? String(data.error) : '';
      throw new Error(errorText || responseText || 'Gateway returned success=false');
    }

    return data;
  }

  async onMessage(obj) {
    if (!obj || !obj.command) return;
    if (obj.command !== 'send' && obj.command !== 'test') return;

    const p = obj.message || {};
    const to = p.to ?? p.phone ?? '';
    const text = p.text ?? p.content ?? p.message ?? '';

    try {
      const result = await this._sendText(to, text, `command:${obj.command}`);
      await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
      await this.setStateAsync('send.lastError', '', true);
      await this.setStateAsync('info.connection', true, true);

      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { ok: true, success: true, result }, obj.callback);
      }
    } catch (e) {
      const err = e?.message || String(e);
      await this.setStateAsync('send.lastError', err, true);
      await this.setStateAsync('info.connection', false, true);
      this.log.error(`${obj.command} failed: ${err}`);
      if (obj.callback) {
        this.sendTo(obj.from, obj.command, { ok: false, success: false, error: err }, obj.callback);
      }
    }
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;
    const shortId = id.replace(this.namespace + '.', '');
    if (shortId !== 'send.text') return;

    const text = String(state.val ?? '').trim();
    const to = String((await this.getStateAsync('send.to'))?.val ?? '').trim();

    try {
      const result = await this._sendText(to, text, 'state:send.text');
      await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
      await this.setStateAsync('send.lastError', '', true);
      await this.setStateAsync('info.connection', true, true);
      await this.setStateAsync('send.text', state.val, true);
    } catch (e) {
      const err = e?.message || String(e);
      await this.setStateAsync('send.lastError', err, true);
      await this.setStateAsync('info.connection', false, true);
      this.log.error(`Send failed: ${err}`);
    }
  }
}

if (module.parent) {
  module.exports = (options) => new OpenWa(options);
} else {
  new OpenWa();
}
