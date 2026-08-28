

const KEY = "kirei-events-id-key-2026";

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToBase64Url(bytes: number[]): string {
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

function base64UrlToBytes(value: string): number[] {
    const lookup = new Map<string, number>();
    for (let i = 0; i < B64_CHARS.length; i++) lookup.set(B64_CHARS[i], i);

    const bytes: number[] = [];
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

function xorWithKey(bytes: number[]): number[] {
    return bytes.map((byte, i) => byte ^ KEY.charCodeAt(i % KEY.length));
}

export function encryptId(id: string | number | undefined | null): string {
    const text = id === undefined || id === null ? "" : String(id);
    const bytes = xorWithKey(Array.from(text).map((ch) => ch.charCodeAt(0)));
    return bytesToBase64Url(bytes);
}

export function decryptId(encoded: string | undefined | null): string {
    if (!encoded) return "";
    const bytes = xorWithKey(base64UrlToBytes(encoded));
    return bytes.map((byte) => String.fromCharCode(byte)).join("");
}
