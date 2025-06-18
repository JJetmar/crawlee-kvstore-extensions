import crypto from "node:crypto";

export function createSecretKey(key: string) {
    return crypto
        .createHash('sha256')
        .update(key)
        .digest('hex')
        .slice(0, 32);
}

export function encrypt(dataToEncrypt: unknown, secretKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(secretKey),
        iv,
    );

    const result = {
        data: Buffer.concat([
            cipher.update(Buffer.from(JSON.stringify(dataToEncrypt))),
            cipher.final(),
        ]).toString('base64'),
        iv: iv.toString('base64'),
    };

    return Buffer.from(JSON.stringify(result)).toString('base64');
}

export function decrypt<T>(dataToDecrypt: string, secretKey: string): T {
    const { data, iv } = JSON.parse(Buffer.from(dataToDecrypt, 'base64').toString());

    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(secretKey),
        Buffer.from(iv, 'base64'),
    );
    return JSON.parse(Buffer.concat([
        decipher.update(Buffer.from(data, 'base64')),
        decipher.final(),
    ]).toString()) as T;
}

export function sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('base64');
}
