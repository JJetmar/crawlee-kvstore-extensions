import { RequestQueue, RequestQueueOperationOptions, Source, Request, Dictionary } from "crawlee";
import { createSecretKey, decrypt, encrypt, sha256 } from '../utils.js';
import type { RequestOptionsEncryptedUserData } from '../types.js';
import Apify from 'apify';


function EncryptRequestQueue<T extends new (...args: any[]) => RequestQueue>(Base: T) {
    return class extends Base {
        override ad


        serialize() {
            return JSON.stringify(this);
        }
    };
}


export class EncryptedRequestQueue extends RequestQueue {
    #secretKey!: string;

    public static override readonly name = 'RequestQueue';

    constructor(
        options: Parameters<typeof RequestQueue.call>[1],
        config: Parameters<typeof RequestQueue.call>[2] & { secretKey: string }
    ) {
        super(options, config);
    }

    #encryptRequest<T extends Request>(requestLike: T): Request<RequestOptionsEncryptedUserData> {
        return {
            ...requestLike,
            url: `https://encrypted.url/${sha256(requestLike.url!)}`,
            handledAt: requestLike.handledAt,
            userData: {
                __encrypted: encrypt(requestLike, this.#secretKey),
            }
        };
    }

    #encryptSource<T extends Source>(sourceLike: T): T {
        return {
            ...sourceLike,
            url: `https://encrypted.url/${sha256(sourceLike.url!)}`,
            handledAt: sourceLike.handledAt,
            userData: {
                __encrypted: encrypt(sourceLike, this.#secretKey),
            },

        };
    }

    #decryptRequest<D extends Dictionary = Dictionary>(encryptedRequest: Request<RequestOptionsEncryptedUserData> | null): Request<D> | null {
        if (!encryptedRequest) return null;
        if (!encryptedRequest.userData?.__encrypted) {
            // If input is not encrypted, it will be returned as it is...
            return encryptedRequest as unknown as Request<D>;
        }

        const decryptedRequest = decrypt<Request<D>>(encryptedRequest.userData.__encrypted, this.#secretKey);
        return new Request<D>({
            ...encryptedRequest,
            ...decryptedRequest,
            userData: decryptedRequest.userData
        });
    }

    public override addRequest(requestLike: Source, options?: RequestQueueOperationOptions) {
        return super.addRequest(this.#encryptSource(requestLike), options);
    }

    public override addRequests(requestsLike: Source[], options?: RequestQueueOperationOptions) {
        return super.addRequests(requestsLike.map(this.#encryptSource), options);
    }

    override async fetchNextRequest<T extends Dictionary = Dictionary>(): Promise<Request<T> | null> {
        const nextRequest = await super.fetchNextRequest<RequestOptionsEncryptedUserData>();
        return this.#decryptRequest(nextRequest);
    }

    override async reclaimRequest(request: Request) {
        const requestsToReclaim = this.#encryptRequest(request);
        return super.reclaimRequest(requestsToReclaim);
    }

    override async markRequestHandled(request: Parameters<typeof RequestQueue.prototype.markRequestHandled>[0]) {
        return await super.markRequestHandled(this.#encryptRequest(request));
    }

    static override async open(
        options: Parameters<typeof RequestQueue.open>[0],
        config: Parameters<typeof RequestQueue.open>[1] & { secretKey: string } // required due to the secret-key
    ): Promise<EncryptedRequestQueue> {
        const { secretKey, ...compatibleConfig } = config;
        // I am not proud, it's hacky, but... it... works...
        type Args = [typeof options, typeof compatibleConfig];
        const instance = await RequestQueue.open.call<RequestQueue, Args, Promise<RequestQueue>>(
            this as unknown as RequestQueue,
            options,
            compatibleConfig
        ) as EncryptedRequestQueue;

        instance.#secretKey = createSecretKey(secretKey);
        return instance;
    }
}
