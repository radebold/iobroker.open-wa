'use strict';
const axios = require('axios');

function toNumber(input) {
  let s = String(input || '').trim();
  if (!s) return '';
  if (s.includes('@')) s = s.split('@')[0];
  if (s.startsWith('00')) s = s.slice(2);
  if (s.startsWith('+')) s = s.slice(1);
  s = s.replace(/\D/g, '');
  return s;
}

class OpenWaApi {
  constructor(baseUrl, token) {
    const url = String(baseUrl || '').replace(/\/+$/, '');
    const headers = { 'Content-Type': 'application/json' };
    const t = String(token || '').trim();
    if (t) headers.Authorization = `Bearer ${t}`;

    this.client = axios.create({ baseURL: url, timeout: 20000, headers });
  }

  // Gateway contract:
  // POST /send {to:"4917...", text:"..."}
  sendText(to, text) {
    return this.client.post('/send', { to: toNumber(to), text: String(text ?? '') });
  }
}

module.exports = OpenWaApi;
module.exports.toNumber = toNumber;
