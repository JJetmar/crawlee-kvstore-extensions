import { describe, beforeEach, test, expect, vi } from 'vitest';
import { RequestOptions, RequestQueue } from "crawlee";
import { EncryptedRequestQueue } from '../src/request-queue/encrypted-request-queue.js';

describe('Testing EncryptedRequestQueue', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    })

    test('addRequest', async () => {
        const encryptedRequest = {
            "handledAt": undefined,
            "url": "https://encrypted.url/d4cXiL15YQz64pm4nJ+WJcQYa+mkTYepZ5osF+2O8VY=",
            "userData": {
                "__encrypted": "eyJkYXRhIjoiYkE1ckJvUmcwNkFYTzRmZWQ4V0ZFUW1xb1dpcXQvWm5icGxRcFdHUVVtMmVBeUZnbllKdjNxcjROdFpFTmwxbjZxRjJwWWh4ZWFObjVPWi9PWngzY2c9PSIsIml2IjoicklKdlZwRDVqZnZMZElGS1E5blF4Zz09In0=",
            }
        };

        // const mockAddRequest = vi.fn();
        // const mockFetchNextRequest = vi.fn(() => {
        //     return Promise.resolve(encryptedRequest);
        // });
        //
        // vi.spyOn(RequestQueue.prototype, 'addRequest').mockImplementation(mockAddRequest);
        // vi.spyOn(RequestQueue.prototype, 'fetchNextRequest').mockImplementation(mockFetchNextRequest);

        const encryptedRequestQueue = await EncryptedRequestQueue.open('request-queue-name', { secretKey: 'mySecretKey' });
        const normalRequestQueue = await RequestQueue.open('request-queue');

        const requestToAdd: RequestOptions = {
            "userData": {
                "secUid": "MS4wLjABAAAA7WOWqJOZ4iuicJVczzlLX0JU9d14WgxcCtmkvFqTqJKBkL85ISMQ0U8EQIA3mbj-",
                "authorMeta": {
                    "id": "7095709566285480965",
                    "name": "apifyoffice",
                    "profileUrl": "https://www.tiktok.com/@apifyoffice",
                    "nickName": "apifyoffice",
                    "verified": false,
                    "signature": "🤖 web scraping and AI 🤖\n\ncheck out our open positions at ✨apify.it/jobs✨",
                    "bioLink": null,
                    "originalAvatarUrl": "https://p16-common-sign-useast2a.tiktokcdn-us.com/tos-useast2a-avt-0068-euttp/2c511269b14f70cca0c11c3285ddc668~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=1d3cc13a&x-expires=1746356400&x-signature=CKvpdImhgMiEN5aDy9cupTSBYtM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
                    "avatar": "https://p16-common-sign-useast2a.tiktokcdn-us.com/tos-useast2a-avt-0068-euttp/2c511269b14f70cca0c11c3285ddc668~tplv-tiktokx-cropcenter:720:720.jpeg?dr=9640&refresh_token=1d3cc13a&x-expires=1746356400&x-signature=CKvpdImhgMiEN5aDy9cupTSBYtM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast8",
                    "commerceUserInfo": {
                        "commerceUser": true,
                        "category": "Software & Apps",
                        "categoryButton": false
                    },
                    "privateAccount": false,
                    "region": "CZ",
                    "roomId": "",
                    "ttSeller": false,
                    "following": 4,
                    "friends": 1,
                    "fans": 131,
                    "heart": 2007,
                    "video": 36,
                    "digg": 0
                },
                "profileSection": "videos",
                "paginationInfo": {
                    "cursor": "1700668181000",
                    "index": 1
                },
                "input": "apifyoffice",
                "searchQuery": "",
                "initialRequest": false,
                "label": "PROFILE_CONTINUATION",
                "previousMsToken": "4pRDWFVWz1dYGXqQImIDFOxmtCkH9ebUmaywhzlvCxrwpi3nB4jhWPpIae1ztLUXTMzbyi22K2Qi09UUda-_bp08p3vntipQBTAA1I-i_KRKyy3k5lhHv-eG97xDYc_wtTA=",
                "captchaDetected": 0,
                "loopProtectionCounter": 0,
                "retryOnCorruptedResponseInfo": {
                    "playCount": {
                        "currentRetryNumber": 0
                    }
                }
            },
            "url": "https://www.tiktok.com/@apifyoffice",
            "method": "GET"
        };
        await encryptedRequestQueue.addRequest(requestToAdd);
        await normalRequestQueue.addRequest(requestToAdd);
        const nextEncrypted = await encryptedRequestQueue.fetchNextRequest()
        const nextNormal = await normalRequestQueue.fetchNextRequest()
        console.log(nextEncrypted, nextEncrypted.userData);
        console.log(nextNormal, nextNormal.userData);



        await encryptedRequestQueue.reclaimRequest(nextEncrypted!);
        await normalRequestQueue.reclaimRequest(nextNormal!);

        const nextEncrypted2 = await encryptedRequestQueue.fetchNextRequest()
        const nextNormal2 = await normalRequestQueue.fetchNextRequest()
        console.log(nextEncrypted, nextEncrypted2.userData);
        console.log(nextNormal, nextNormal2.userData);


        //await encryptedRequestQueue.drop()
        // await normalRequestQueue.drop()
        // expect(mockAddRequest).toBeCalledWith(encryptedRequest);
        // expect(mockFetchNextRequest).toReturn({});
    }, 999999999);

});
