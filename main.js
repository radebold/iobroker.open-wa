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
    // States for quick/manual testing (optional)
    await this.setObjectNotExistsAsync('send.to', {
      type: 'state',
      common: { name: 'Recipient (phone or chatId)', type: 'string', role: 'text', read: true, write: true },
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
    const basePath = (this.config.basePath || '').replace(/\/+$/, '');
    const url = `http://${ip}:${port}${basePath ? '/' + basePath.replace(/^\/+/, '') : ''}`;

    this.log.info(`Using gateway: ${url}`);
    this.api = new OpenWaApi(url);
    await this.setStateAsync('info.connection', true, true);
  }

  async onUnload(callback) {
    try { callback(); } catch { callback(); }
  }

  async _sendText(to, content) {
    const msg = String(content ?? '').trim();
    const dest = String(to ?? '').trim();
    if (!msg) throw new Error('Empty message');
    if (!dest) throw new Error('Recipient missing');
    const res = await this.api.sendText(dest, msg);
    return res?.data ?? res;
  }

  async _sendImage(payload) {
    const to = String(payload?.to ?? '').trim();
    const file = payload?.file;
    const filename = payload?.filename;
    const caption = payload?.caption;

    if (!to) throw new Error('Recipient missing');
    if (!file) throw new Error('File missing');
    if (!filename) throw new Error('Filename missing');

    // pass through optional fields (only if defined)
    const opts = {};
    const optKeys = ['quotedMsgId','waitForId','ptt','withoutPreview','hideTags','viewOnce','requestConfig'];
    for (const k of optKeys) {
      if (payload[k] !== undefined) opts[k] = payload[k];
    }

    const res = await this.api.sendImage(to, file, filename, caption, opts);
    return res?.data ?? res;
  }

  async onMessage(obj) {
    try {
      if (!obj || !obj.command) return;

      if (obj.command === 'send') {
        const p = obj.message || {};
        const content = p.content ?? p.text ?? '';
        const to = p.to ?? p.phone ?? '';
        try {
          const result = await this._sendText(to, content);
          await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
          await this.setStateAsync('send.lastError', '', true);
          await this.setStateAsync('info.connection', true, true);
          if (obj.callback) this.sendTo(obj.from, obj.command, { ok: true, result }, obj.callback);
        } catch (e) {
          await this.setStateAsync('send.lastError', e.message, true);
          await this.setStateAsync('info.connection', false, true);
          this.log.error(`sendTo(send) failed: ${e.message}`);
          if (obj.callback) this.sendTo(obj.from, obj.command, { ok: false, error: e.message }, obj.callback);
        }
        return;
      }

      if (obj.command === 'sendImage') {
        const p = obj.message || {};
        try {
          const result = await this._sendImage(p);
          await this.setStateAsync('send.lastResult', JSON.stringify(result), true);
          await this.setStateAsync('send.lastError', '', true);
          await this.setStateAsync('info.connection', true, true);
          if (obj.callback) this.sendTo(obj.from, obj.command, { ok: true, result }, obj.callback);
        } catch (e) {
          await this.setStateAsync('send.lastError', e.message, true);
          await this.setStateAsync('info.connection', false, true);
          this.log.error(`sendTo(sendImage) failed: ${e.message}`);
          if (obj.callback) this.sendTo(obj.from, obj.command, { ok: false, error: e.message }, obj.callback);
        }
        return;
      }
    } catch (e) {
      this.log.error(`onMessage handler crashed: ${e.message}`);
    }
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;

    const shortId = id.replace(this.namespace + '.', '');
    if (shortId !== 'send.text') return;

    const content = String(state.val ?? '').trim();
    const to = String((await this.getStateAsync('send.to'))?.val ?? '').trim();

    try {
      const result = await this._sendText(to, content);
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
