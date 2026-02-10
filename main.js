const utils = require('@iobroker/adapter-core');
const axios = require('axios');

class OpenWa extends utils.Adapter {
  constructor(options = {}) {
    super({ ...options, name: 'open-wa' });
    this.on('ready', this.onReady.bind(this));
  }

  async onReady() {
    await this.setObjectNotExistsAsync('info.connection', {
      type: 'state',
      common: {
        name: 'Connection',
        type: 'boolean',
        role: 'indicator.connected',
        read: true,
        write: false
      },
      native: {}
    });

    const ip = this.config.serverIp;
    const port = this.config.serverPort;
    const basePath = (this.config.basePath || '').replace(/\/+$/, '');

    this.baseUrl = `http://${ip}:${port}${basePath ? '/' + basePath.replace(/^\/+/, '') : ''}`;
    this.log.info(`Using Open-WA gateway: ${this.baseUrl}`);

    await this.testConnection();
  }

  async testConnection() {
    try {
      await axios.get(`${this.baseUrl}/api-docs`, { timeout: 5000 });
      await this.setStateAsync('info.connection', true, true);
      this.log.info('Gateway reachable');
    } catch (e) {
      await this.setStateAsync('info.connection', false, true);
      this.log.error(`Gateway not reachable: ${e.message}`);
    }
  }
}

if (module.parent) {
  module.exports = (options) => new OpenWa(options);
} else {
  new OpenWa();
}
