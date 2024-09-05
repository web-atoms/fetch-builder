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

type IRequest = { url?: string } & RequestInit;

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
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        return await r.text();
    }

    public async asBlob(ensureSuccess = true) {
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        return await r.blob();
    }

    public async asJson<T = any>(ensureSuccess = true) {
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        return (await r.json()) as T;
    }

    public async asJsonResponse<T = any>(ensureSuccess = true) {
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        const result = (await r.json()) as T;
        return { result, headers: r.headers, status: r.status };
    }

    public async asTextResponse(ensureSuccess = true) {
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        const result = await r.text();
        return { result, headers: r.headers, status: r.status };
    }

    public async asBlobResponse(ensureSuccess = true) {
        const r = await this.response();
        if (ensureSuccess) {
            await this.ensureSuccess(r);
        }
        const result = await r.blob();
        return { result, headers: r.headers, status: r.status };
    }

    public response() {
        return fetch(this.request.url, this.request);
    }

    private async ensureSuccess(r: Response) {
        if (r.status <= 300) {
            return;
        }
        // is json...
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

    private append(r: IRequest) {
        return new FetchBuilder({ ... this.request, ... r});
    }

}

export class JsonError extends Error {
    constructor(message, public readonly json) {
        super(message);
    }
}
