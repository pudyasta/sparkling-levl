// utils/imageToBase64.js
import axios from 'axios';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function arrayBufferToBase64(buffer: any) {
  const bytes = new Uint8Array(buffer);
  let base64 = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];

    base64 += BASE64_CHARS[b0 >> 2];
    base64 += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    base64 += i + 1 < len ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    base64 += i + 2 < len ? BASE64_CHARS[b2 & 63] : '=';
  }

  return base64;
}

function getMimeType(url: string) {
  if (url.includes('.png')) return 'image/png';
  if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg';
  if (url.includes('.webp')) return 'image/webp';
  if (url.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export async function urlToBase64(url: string) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const base64 = arrayBufferToBase64(response.data);
  const mimeType = getMimeType(url);
  return `data:${mimeType};base64,${base64}`;
}

const cache = new Map();

export async function urlToBase64Cached(url: string) {
  if (cache.has(url)) return cache.get(url);

  const base64 = await urlToBase64(url);
  cache.set(url, base64);
  return base64;
}
