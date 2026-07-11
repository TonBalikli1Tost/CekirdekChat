// Native bindings mock/fallback for encryption functions.
// If a native addon is built, it should be placed at ./build/Release/nativeaddon.node
// This module will attempt to load it and otherwise use JS fallback.

let native;
try {
  native = require('./build/Release/nativeaddon');
} catch (e) {
  native = null;
}

const crypto = require('crypto');

module.exports.encrypt = function (plain, key) {
  if (native && native.encrypt) return native.encrypt(plain, key);
  // JS fallback: AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

module.exports.decrypt = function (hex, key) {
  if (native && native.decrypt) return native.decrypt(hex, key);
  const buf = Buffer.from(hex, 'hex');
  const iv = buf.slice(0,12);
  const tag = buf.slice(12,28);
  const encrypted = buf.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
