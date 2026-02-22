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
      common: { name: 'Recipient (phone number)', type: 'string', role: 'text', read: true, write: true },
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
  }

  async onUnload(callback) {
    try { callback(); } catch { callback(); }
  }

  async _sendText(to, text) {
    const msg = String(text ?? '').trim();
    const dest = String(to ?? '').trim();
    if (!msg) throw new Error('Empty message');
    if (!dest) throw new Error('Recipient missing');

    const res = await this.api.sendText(dest, msg);
    return res?.data ?? res;
  }

  async onMessage(obj) {
    if (!obj || !obj.command) return;
    if (obj.command !== 'send') return;

    const p = obj.message || {};
    const to = p.to ?? p.phone ?? '';
    const text = p.text ?? p.content ?? p.message ?? '';

    try {
      const result = await this._sendText(to, text);
      await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
      await this.setStateAsync('send.lastError', '', true);
      await this.setStateAsync('info.connection', true, true);

      if (obj.callback) this.sendTo(obj.from, obj.command, { ok: true, result }, obj.callback);
    } catch (e) {
      await this.setStateAsync('send.lastError', e.message, true);
      await this.setStateAsync('info.connection', false, true);
      this.log.error(`send failed: ${e.message}`);
      if (obj.callback) this.sendTo(obj.from, obj.command, { ok: false, error: e.message }, obj.callback);
    }
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;
    const shortId = id.replace(this.namespace + '.', '');
    if (shortId !== 'send.text') return;

    const text = String(state.val ?? '').trim();
    const to = String((await this.getStateAsync('send.to'))?.val ?? '').trim();

    try {
      const result = await this._sendText(to, text);
      await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
      await this.setStateAsync('send.lastError', '', true);
      await this.setStateAsync('info.connection', true, true);
      await this.setStateAsync('send.text', state.val, true);
    } catch (e) {
      await this.setStateAsync('send.lastError', e.message, true);
      await this.setStateAsync('info.connection', false, true);
      this.log.error(`Send failed: ${e.message}`);
    }
  }
}

if (module.parent) {
  module.exports = (options) => new OpenWa(options);
} else {
  new OpenWa();
}
