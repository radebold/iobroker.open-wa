'use strict';
const axios = require('axios');

function toChatId(input) {
  let s = String(input || '').trim();
  if (!s) return '';
  if (s.includes('@c.us') || s.includes('@g.us')) return s;
  if (s.startsWith('00')) s = s.slice(2);
  if (s.startsWith('+')) s = s.slice(1);
  s = s.replace(/\D/g, '');
  return s + '@c.us';
}

class OpenWaApi {
  constructor(baseUrl) {
    this.client = axios.create({ baseURL: baseUrl, timeout: 10000 });
  }

  sendText(to, text) {
    return this.client.post('/sendText', {
      phone: toChatId(to),
      message: text
    });
  }
}

module.exports = OpenWaApi;
