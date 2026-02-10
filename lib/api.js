const axios = require('axios');

class OpenWaApi {
  constructor(baseUrl) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000
    });
  }

  sendText(phone, message) {
    return this.client.post('/sendText', { phone, message });
  }
}

module.exports = OpenWaApi;
