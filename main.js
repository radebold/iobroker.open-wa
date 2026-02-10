'use strict';
const utils = require('@iobroker/adapter-core');
const OpenWaApi = require('./lib/api');

class OpenWa extends utils.Adapter {
  constructor(options = {}) {
    super({ ...options, name: 'open-wa' });
    this.on('ready', this.onReady.bind(this));
    this.on('stateChange', this.onStateChange.bind(this));
  }

  async onReady() {
    await this.setObjectNotExistsAsync('send.to', {
      type: 'state',
      common: { name: 'Recipient', type: 'string', read: true, write: true },
      native: {}
    });

    await this.setObjectNotExistsAsync('send.text', {
      type: 'state',
      common: { name: 'Message', type: 'string', read: true, write: true },
      native: {}
    });

    const { serverIp, serverPort } = this.config;
    this.api = new OpenWaApi(`http://${serverIp}:${serverPort}`);

    this.subscribeStates('send.text');
  }

  async onStateChange(id, state) {
    if (!state || state.ack) return;

    if (id.endsWith('send.text')) {
      const text = String(state.val || '').trim();
      const to = (await this.getStateAsync('send.to'))?.val;

      if (!text || !to) return;

      try {
        await this.api.sendText(to, text);
        await this.setStateAsync(id, state.val, true);
      } catch (e) {
        this.log.error(`Send failed: ${e.message}`);
      }
    }
  }
}

module.exports = (options) => new OpenWa(options);
