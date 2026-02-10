'use strict';

const utils = require('@iobroker/adapter-core');
const OpenWaApi = require('./lib/api');

class OpenWa extends utils.Adapter {
  constructor(options = {}) {
    super({ ...options, name: 'open-wa' });

    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    this.on('unload', this.onUnload.bind(this));

    this.api = null;
  }

  async onReady() {
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
    try {
      callback();
    } catch {
      callback();
    }
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;

    const shortId = id.replace(this.namespace + '.', '');

    if (shortId === 'send.text') {
      const content = String(state.val ?? '').trim();
      const to = String((await this.getStateAsync('send.to'))?.val ?? '').trim();

      if (!content) {
        await this.setStateAsync('send.lastError', 'Empty message - not sent', true);
        return;
      }
      if (!to) {
        await this.setStateAsync('send.lastError', 'Recipient missing (send.to)', true);
        return;
      }

      try {
        const res = await this.api.sendText(to, content);
        await this.setStateAsync('send.lastResult', JSON.stringify(res.data ?? res), true);
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
}

if (module.parent) {
  module.exports = (options) => new OpenWa(options);
} else {
  new OpenWa();
}
