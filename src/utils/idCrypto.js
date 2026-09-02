import aesjs from "aes-js";

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

function deriveKey(str) {
    const utf8 = Array.from(new TextEncoder().encode(str));
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = utf8[i % utf8.length];
    return key;
}

const AES_KEY = deriveKey(KEY);

export function encryptId(id) {
    const text = id === undefined || id === null ? "" : String(id);
    const plainBytes = new TextEncoder().encode(text);
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const cipher = new aesjs.ModeOfOperation.ctr(AES_KEY, new aesjs.Counter(iv));
    const cipherBytes = cipher.encrypt(plainBytes);
    return bytesToBase64Url([...Array.from(iv), ...Array.from(cipherBytes)]);
}

export function decryptId(encoded) {
    if (!encoded) return "";
    const allBytes = base64UrlToBytes(encoded);
    if (allBytes.length < 16) return "";
    const iv = new Uint8Array(allBytes.slice(0, 16));
    const cipherBytes = new Uint8Array(allBytes.slice(16));
    const decipher = new aesjs.ModeOfOperation.ctr(AES_KEY, new aesjs.Counter(iv));
    const plainBytes = decipher.decrypt(cipherBytes);
    return new TextDecoder().decode(plainBytes);
}
