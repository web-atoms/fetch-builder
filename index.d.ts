/// <reference types="node" />
/// <reference types="node" />
export declare function buildUrl(strings: TemplateStringsArray, ...p: any[]): string;
export default class FetchBuilder {
    private readonly request;
    static get(url: any): FetchBuilder;
    static put(url: any): FetchBuilder;
    static post(url: any): FetchBuilder;
    static delete(url: any): FetchBuilder;
    static header(name: string, value: string): FetchBuilder;
    static method(url: any, method: string): FetchBuilder;
    private constructor();
    log(logger: (...a: any[]) => void): FetchBuilder;
    logWhenFailed(logger: (...a: any[]) => void): FetchBuilder;
    get(url: any): void;
    put(url: any): void;
    post(url: any): void;
    delete(url: any): void;
    method(url: string, method: string): void;
    signal(signal: AbortSignal): FetchBuilder;
    form(name: string, value: string): FetchBuilder;
    form(name: string, value: Blob, fileName: string): FetchBuilder;
    jsonBody(body: any, encode?: boolean): FetchBuilder;
    header(name: string, value: string): FetchBuilder;
    path(name: string, value: any, encode?: boolean): FetchBuilder;
    query(name: string, value: any, encode?: boolean): FetchBuilder;
    asText(ensureSuccess?: boolean): Promise<string>;
    asBlob(ensureSuccess?: boolean): Promise<import("buffer").Blob>;
    asJson<T = any>(ensureSuccess?: boolean): Promise<unknown>;
    asJsonResponse<T = any>(ensureSuccess?: boolean): Promise<{
        result: Promise<unknown>;
        headers: any;
        status: number;
    }>;
    asTextResponse(ensureSuccess?: boolean): Promise<{
        result: Promise<string>;
        headers: any;
        status: number;
    }>;
    asBlobResponse(ensureSuccess?: boolean): Promise<{
        result: Promise<import("buffer").Blob>;
        headers: any;
        status: number;
    }>;
    execute<T>(ensureSuccess: boolean, postProcessor: (r: Response) => T): Promise<{
        result: T;
        headers: any;
        status: number;
    }>;
    private append;
}
export declare class JsonError extends Error {
    readonly json: any;
    constructor(message: any, json: any);
}
//# sourceMappingURL=index.d.ts.map