'use strict';
const axios = require('axios');

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').replace(/\/+$/, '');
}

class OpenWaApi {
  /**
   * @param {string} baseUrl
   * @param {string} apiKey optional
   */
  constructor(baseUrl, apiKey) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    const headers = {};
    if (apiKey) {
      // Many gateways use x-api-key or Authorization; we support both via config later if needed.
      headers['x-api-key'] = apiKey;
    }
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers
    });
  }

  async pingSwagger() {
    // Your screenshot shows swagger at /api-docs
    return this.client.get('/api-docs');
  }

  async sendText(phone, message) {
    // Common open-wa gateway shape (can be adapted later if your gateway differs)
    return this.client.post('/sendText', { phone, message });
  }
}

module.exports = OpenWaApi;
