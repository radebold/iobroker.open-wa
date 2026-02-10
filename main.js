'use strict';

const utils = require('@iobroker/adapter-core');
const OpenWaApi = require('./lib/api');

class OpenWa extends utils.Adapter {
  constructor(options = {}) {
    super({ ...options, name: 'open-wa' });

    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
    this.on('unload', this.onUnload.bind(this));

    this._pollTimer = null;
    this.api = null;
    this.baseUrl = '';
  }

  async onReady() {
    // ----- Objects/States -----
    await this.setObjectNotExistsAsync('info.connection', {
      type: 'state',
      common: { name: 'Connection', type: 'boolean', role: 'indicator.connected', read: true, write: false },
      native: {}
    });

    await this.setObjectNotExistsAsync('status.lastCheck', {
      type: 'state',
      common: { name: 'Last check', type: 'string', role: 'date', read: true, write: false },
      native: {}
    });

    await this.setObjectNotExistsAsync('send.to', {
      type: 'state',
      common: {
        name: 'Recipient number (international format recommended)',
        type: 'string',
        role: 'text',
        read: true,
        write: true
      },
      native: {}
    });

    await this.setObjectNotExistsAsync('send.text', {
      type: 'state',
      common: {
        name: 'Message text (write to send)',
        type: 'string',
        role: 'text',
        read: true,
        write: true
      },
      native: {}
    });

    await this.setObjectNotExistsAsync('send.lastResult', {
      type: 'state',
      common: { name: 'Last send result', type: 'string', role: 'json', read: true, write: false },
      native: {}
    });

    await this.setObjectNotExistsAsync('send.lastError', {
      type: 'state',
      common: { name: 'Last send error', type: 'string', role: 'text', read: true, write: false },
      native: {}
    });

    this.subscribeStates('send.*');

    // ----- Config -> Base URL -----
    const ip = this.config.serverIp;
    const port = this.config.serverPort;
    const basePath = (this.config.basePath || '').replace(/\/+$/, ''); // trailing slash weg
    const apiKey = (this.config.apiKey || '').trim();

    this.baseUrl = `http://${ip}:${port}${basePath ? '/' + basePath.replace(/^\/+/, '') : ''}`;
    this.log.info(`Using Open-WA gateway: ${this.baseUrl}`);

    this.api = new OpenWaApi(this.baseUrl, apiKey);

    // initial check
    await this.checkGateway();

    // polling
    const pollIntervalSec = Math.max(10, Number(this.config.pollIntervalSec) || 60);
    this._pollTimer = setInterval(() => {
      this.checkGateway().catch(e => this.log.debug(`checkGateway failed: ${e.message}`));
    }, pollIntervalSec * 1000);
  }

  async onUnload(callback) {
    try {
      if (this._pollTimer) {
        clearInterval(this._pollTimer);
        this._pollTimer = null;
      }
      callback();
    } catch (e) {
      callback();
    }
  }

  async checkGateway() {
    try {
      await this.api.pingSwagger();
      await this.setStateAsync('info.connection', true, true);
      await this.setStateAsync('status.lastCheck', new Date().toISOString(), true);
    } catch (e) {
      await this.setStateAsync('info.connection', false, true);
      await this.setStateAsync('status.lastCheck', new Date().toISOString(), true);
      this.log.warn(`Gateway not reachable: ${e.message}`);
    }
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;

    const shortId = id.replace(this.namespace + '.', '');

    if (shortId === 'send.text') {
      const msg = String(state.val ?? '').trim();
      if (!msg) {
        await this.setStateAsync('send.lastError', 'Empty message - not sent', true);
        return;
      }

      const toState = await this.getStateAsync('send.to');
      const to = String(toState?.val ?? '').trim();

      if (!to) {
        await this.setStateAsync('send.lastError', 'Recipient number missing (send.to)', true);
        return;
      }

      try {
        const res = await this.api.sendText(to, msg);
        await this.setStateAsync('send.lastResult', JSON.stringify(res.data ?? res), true);
        await this.setStateAsync('send.lastError', '', true);

        // Ack the send.text write (optional: keep the text; we simply ack it)
        await this.setStateAsync('send.text', state.val, true);
      } catch (e) {
        await this.setStateAsync('send.lastError', e.message, true);
        this.log.error(`sendText failed: ${e.message}`);
      }
    }
  }
}

if (module.parent) {
  module.exports = (options) => new OpenWa(options);
} else {
  new OpenWa();
}
