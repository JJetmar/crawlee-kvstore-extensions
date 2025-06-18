import crypto from 'node:crypto';
import { KeyValueStoreLike } from '../types.js';

export class EncryptedKeyValueStore implements KeyValueStoreLike {
    #cryptSecret: string;

    constructor(private kvstore: KeyValueStoreLike, secretKey: string) {
        this.#cryptSecret = crypto
            .createHash('sha256')
            .update(secretKey)
            .digest('hex')
            .slice(0, 32);
    }

    async getValue<T = unknown>(key: string, defaultValue?: T) {
        const encryptedValue = await this.kvstore.getValue<string>(key);

        if (encryptedValue == null) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            return null;
        }

        try {
            return this.#decrypt(encryptedValue) as T;
        } catch (error) {
            if ((error as { code?: string })?.['code'] === 'ERR_OSSL_EVP_BAD_DECRYPT') {
                throw new Error(`Unable to decrypt key: "${key}". Possibly wrong secret key is used...`);
            }
            throw error;
        }
    }

    async setValue<T>(key: string, value: T | null): Promise<void> {
        if (value === null) {
            return await this.kvstore.setValue(key, null);
        } else {
            return await this.kvstore.setValue(key, this.#encrypt(value));
        }
    }

    #encrypt(dataToEncrypt: unknown): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(this.#cryptSecret),
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

    #decrypt<T>(dataToDecrypt: string): T {
        const { data, iv } = JSON.parse(Buffer.from(dataToDecrypt, 'base64').toString());

        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(this.#cryptSecret),
            Buffer.from(iv, 'base64'),
        );
        return  JSON.parse(Buffer.concat([
            decipher.update(Buffer.from(data, 'base64')),
            decipher.final(),
        ]).toString()) as T;
    }
}
