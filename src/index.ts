export function buildUrl(strings: TemplateStringsArray, ... p: any[]) {
    let r = "";
    for (let index = 0; index < strings.length; index++) {
        const element = strings[index];
        r += element;
        if(index < p.length) {
            r += encodeURIComponent(p[index]);
        }
    }
    return r;
}

type IBuilder = (r: Request) => Request;

type IRequest = { url?: string, log?: (...a: any[]) => void, logError?: (...a: any[]) => void } & RequestInit;

export default class FetchBuilder {

    public static get(url) {
        return this.method(url, "GET");
    }

    public static put(url) {
        return this.method(url, "PUT");
    }

    public static post(url) {
        return this.method(url, "POST");
    }

    public static delete(url) {
        return this.method(url, "DELETE");
    }

    public static header(name: string, value: string) {
        return new FetchBuilder({ headers: { url: "", method: "POST", [name]: value }});
    }

    public static method(url, method: string) {
        return new FetchBuilder({ url, method });
    }

    private constructor(private readonly request: IRequest) {
    }

    public log(logger: (...a: any[]) => void) {
        return this.append({ log: logger });
    }

    public logWhenFailed(logger: (...a: any[]) => void) {
        return this.append({ logError: logger });
    }

    public get(url) {
        return this.method(url, "GET");
    }

    public put(url) {
        return this.method(url, "PUT");
    }

    public post(url) {
        return this.method(url, "POST");
    }

    public delete(url) {
        return this.method(url, "DELETE");
    }

    public method(url: string, method: string ) {
        this.append({ url, method });
    }

    // public cancelToken(cancelToken: CancelToken) {
    //     const ac = new AbortController();
    //     cancelToken.registerForCancel(() => ac.abort());
    //     return this.signal(ac.signal);
    // }

    public signal(signal: AbortSignal) {
        return this.append({
            signal
        });
    }

    public form(name: string, value: string): FetchBuilder;
    public form(name: string, value: Blob, fileName: string): FetchBuilder;
    public form(name: string, value: string | Blob, fileName?: string ): FetchBuilder {
        if (value === void 0) {
            return this;
        }
        const body = this.request.body as FormData ?? new FormData();
        if (fileName) {
            if (typeof value === "string") {
                throw new Error("value must be a blob with content type set correctly.");
            }
            body.append(name, value as Blob, fileName)
        } else {
            body.append(name, value);
        }
        return this.append ({ body });
    }

    public jsonBody(body, encode = true) {
        if (encode) {
            body = JSON.stringify(body);
        }
        const headers = this.request.headers ?? {};
        headers["content-type"] = "application/json";
        return this.append ({ body, headers });
    }

    public header(name: string, value: string) {
        const headers = this.request.headers ?? {};
        headers[name] = value;
        return this.append({ headers });
    }

    public path(name: string, value: any, encode = true) {
        let url = this.request.url;
        if (encode) {
            value = encodeURIComponent(value);
        }
        url = url.replace(name, value);
        return this.append({ url });
    }

    public query(name: string, value: any, encode = true) {
        if (value === void 0) {
            return this;
        }
        let url = this.request.url;
        if (encode) {
            value = encodeURIComponent(value);
        }
        name = encodeURIComponent(name);
        if (url.indexOf("?") === -1) {
            url += `?${name}=${value}`;
        } else {
            url += `&${name}=${value}`;
        }
        return this.append({ url });
    }

    public async asText(ensureSuccess = true) {
        const { result } = await this.asTextResponse(ensureSuccess);
        return result;
    }

    public async asBlob(ensureSuccess = true) {
        const { result } = await this.asBlobResponse(ensureSuccess);
        return result;
    }

    public async asJson<T = any>(ensureSuccess = true) {
        const { result } = await this.asJsonResponse<T>(ensureSuccess);
        return result;
    }

    public async asJsonResponse<T = any>(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.json());
    }

    public async asTextResponse(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.text());
    }

    public asBlobResponse(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.blob());
    }

    public async execute<T>(ensureSuccess = true, postProcessor: (r: Response) => T): Promise<{ result: T, headers: any, status: number }> {

        try {

            const { headers, logError } = this.request;
            let { log } = this.request;
            const r = await fetch(this.request.url, this.request);
            if (ensureSuccess) {
                if (r.status > 300) {
                    log = logError;
                    log?.(`fetch: ${this.request.method ?? "GET"} ${this.request.url}`);
                    if (log && headers) {
                        for (const key in headers) {
                            if ((Object.hasOwn && Object.hasOwn(headers,key)) || headers.hasOwnProperty(key)) {
                                log?.(`${key}: ${headers[key]}`);
                            }
                        }
                    }
                    const type = r.headers.get("content-type");
                    if (/\/json/i.test(type)) {
                        const json: any = await r.json();
                        const message = json.title
                        ?? json.detail
                        ?? json.message
                        ?? json.exceptionMessage
                        ?? "Json Server Error";
                        throw new JsonError(message, json);
                    }
                    const text = await r.text();
                    throw new Error(`Failed for ${this.request.url}\n${text}`);
                }
            }
            log?.(`${this.request.method ?? "GET"} ${this.request.url}`);
            if (log && headers) {
                for (const key in headers) {
                    if ((Object.hasOwn && Object.hasOwn(headers,key)) || headers.hasOwnProperty(key)) {
                        log?.(`${key}: ${headers[key]}`);
                    }
                }
            }
            const result = await postProcessor(r);
            if (log) {
                log(`${r.status} ${r.statusText || "OK"}`)
                log(result);
            }
            return { result, headers: r.headers, status: r.status };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    private append(r: IRequest) {
        return new FetchBuilder({ ... this.request, ... r});
    }

}

export class JsonError extends Error {
    constructor(message, public readonly json) {
        super(message);
    }
}