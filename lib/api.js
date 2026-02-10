'use strict';
const axios = require('axios');

function toChatId(input) {
  let s = String(input || '').trim();
  if (!s) return '';
  if (s.includes('@c.us') || s.includes('@g.us')) return s;
  if (s.startsWith('00')) s = s.slice(2);
  if (s.startsWith('+')) s = s.slice(1);
  s = s.replace(/\D/g, '');
  return s ? s + '@c.us' : '';
}

class OpenWaApi {
  constructor(baseUrl) {
    const url = String(baseUrl || '').replace(/\/+$/, '');
    this.client = axios.create({ baseURL: url, timeout: 10000 });
  }

  sendText(to, content) {
    return this.client.post('/sendText', {
      args: {
        to: toChatId(to),
        content
      }
    });
  }
}

module.exports = OpenWaApi;
module.exports.toChatId = toChatId;
