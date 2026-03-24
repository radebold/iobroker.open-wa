'use strict';
const axios = require('axios');

function normalizeRecipient(input) {
  let s = String(input || '').trim();
  if (!s) return '';

  // Preserve WhatsApp JIDs for groups and contacts
  if (s.endsWith('@g.us') || s.endsWith('@c.us')) {
    return s;
  }

  // Normalize phone numbers to international digits without + / 00
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

    this.client = axios.create({
      baseURL: url,
      timeout: 20000,
      headers,
    });
  }

  // Gateway contract:
  // POST /sendText {to:"1203...@g.us"|"4917...", content:"..."}
  sendText(to, text) {
    return this.client.post('/sendText', {
      to: normalizeRecipient(to),
      content: String(text ?? ''),
    });
  }
}

module.exports = OpenWaApi;
module.exports.normalizeRecipient = normalizeRecipient;
