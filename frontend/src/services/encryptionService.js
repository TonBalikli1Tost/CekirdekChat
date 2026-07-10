import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Generate a key pair for E2EE
 */
export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(keyPair.publicKey),
    secretKey: encodeBase64(keyPair.secretKey),
  };
}

/**
 * Encrypt a message with recipient's public key
 */
export function encryptMessage(message, recipientPublicKey, senderSecretKey) {
  try {
    const nonce = nacl.randomBytes(24);
    const messageUint8 = new TextEncoder().encode(message);
    
    const encrypted = nacl.box(
      messageUint8,
      nonce,
      decodeBase64(recipientPublicKey),
      decodeBase64(senderSecretKey)
    );

    return {
      nonce: encodeBase64(nonce),
      encrypted: encodeBase64(encrypted),
    };
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
}

/**
 * Decrypt a message with sender's public key
 */
export function decryptMessage(encryptedData, senderPublicKey, recipientSecretKey) {
  try {
    const decrypted = nacl.box.open(
      decodeBase64(encryptedData.encrypted),
      decodeBase64(encryptedData.nonce),
      decodeBase64(senderPublicKey),
      decodeBase64(recipientSecretKey)
    );

    if (!decrypted) {
      console.error('Decryption failed - invalid signature');
      return null;
    }

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

/**
 * Sign a message (simple verification)
 */
export function signMessage(message, secretKey) {
  const messageUint8 = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageUint8, decodeBase64(secretKey));
  return encodeBase64(signature);
}

/**
 * Verify a message signature
 */
export function verifySignature(message, signature, publicKey) {
  try {
    const messageUint8 = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(
      messageUint8,
      decodeBase64(signature),
      decodeBase64(publicKey)
    );
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
