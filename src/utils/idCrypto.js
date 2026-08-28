// Plain-JS mirror of app/utils/idCrypto.ts, used by server/server.js and
// src/services/mailer.js which run under plain Node (no TS transpilation).
// Keep this in sync with app/utils/idCrypto.ts — same KEY, same algorithm —
// so links generated here decode correctly in the browser and vice versa.

const KEY = "kirei-events-id-key-2026";

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToBase64Url(bytes) {
    let result = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

        result += B64_CHARS[b0 >> 2];
        result += B64_CHARS[((b0 & 0x03) << 4) | (b1 !== undefined ? b1 >> 4 : 0)];
        if (b1 !== undefined) {
            result += B64_CHARS[((b1 & 0x0f) << 2) | (b2 !== undefined ? b2 >> 6 : 0)];
        }
        if (b2 !== undefined) {
            result += B64_CHARS[b2 & 0x3f];
        }
    }
    return result;
}

function base64UrlToBytes(value) {
    const lookup = new Map();
    for (let i = 0; i < B64_CHARS.length; i++) lookup.set(B64_CHARS[i], i);

    const bytes = [];
    let buffer = 0;
    let bits = 0;
    for (const char of value) {
        const val = lookup.get(char);
        if (val === undefined) continue;
        buffer = (buffer << 6) | val;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            bytes.push((buffer >> bits) & 0xff);
        }
    }
    return bytes;
}

function xorWithKey(bytes) {
    return bytes.map((byte, i) => byte ^ KEY.charCodeAt(i % KEY.length));
}

export function encryptId(id) {
    const text = id === undefined || id === null ? "" : String(id);
    const bytes = xorWithKey(Array.from(text).map((ch) => ch.charCodeAt(0)));
    return bytesToBase64Url(bytes);
}

export function decryptId(encoded) {
    if (!encoded) return "";
    const bytes = xorWithKey(base64UrlToBytes(encoded));
    return bytes.map((byte) => String.fromCharCode(byte)).join("");
}
