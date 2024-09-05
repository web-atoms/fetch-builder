"use strict";
class FetchBuilder {
    static buildUrl(strings, ...p) {
        let r = "";
        for (let index = 0; index < strings.length; index++) {
            const element = strings[index];
            r += element;
            if (index < p.length) {
                r += encodeURIComponent(p[index]);
            }
        }
        return r;
    }
    static get(url) {
        return this.method(url, "GET");
    }
    static put(url) {
        return this.method(url, "PUT");
    }
    static post(url) {
        return this.method(url, "POST");
    }
    static delete(url) {
        return this.method(url, "DELETE");
    }
    static url(url) {
        return this.method(url, "GET");
    }
    static header(name, value) {
        return new FetchBuilder({ headers: { url: "", method: "POST", [name]: value } });
    }
    static method(url, method) {
        return new FetchBuilder({ url, method });
    }
    constructor(request) {
        this.request = request;
    }
    log(logger) {
        return this.append({ log: logger });
    }
    logWhenFailed(logger) {
        return this.append({ logError: logger });
    }
    get(url) {
        return this.method(url, "GET");
    }
    put(url) {
        return this.method(url, "PUT");
    }
    post(url) {
        return this.method(url, "POST");
    }
    delete(url) {
        return this.method(url, "DELETE");
    }
    method(url, method) {
        return this.append({ url, method });
    }
    // public cancelToken(cancelToken: CancelToken) {
    //     const ac = new AbortController();
    //     cancelToken.registerForCancel(() => ac.abort());
    //     return this.signal(ac.signal);
    // }
    signal(signal) {
        return this.append({
            signal
        });
    }
    form(name, value, fileName) {
        if (value === void 0) {
            return this;
        }
        const body = this.request.body ?? new FormData();
        if (fileName) {
            if (typeof value === "string") {
                throw new Error("value must be a blob with content type set correctly.");
            }
            body.append(name, value, fileName);
        }
        else {
            body.append(name, value);
        }
        return this.append({ body });
    }
    jsonBody(body, encode = true) {
        if (encode) {
            body = JSON.stringify(body);
        }
        const headers = this.request.headers ?? {};
        headers["content-type"] = "application/json";
        return this.append({ body, headers });
    }
    header(name, value) {
        const headers = this.request.headers ?? {};
        headers[name] = value;
        return this.append({ headers });
    }
    path(name, value, encode = true) {
        let url = this.request.url;
        if (encode) {
            value = encodeURIComponent(value);
        }
        url = url.replace(name, value);
        return this.append({ url });
    }
    query(name, value, encode = true) {
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
        }
        else {
            url += `&${name}=${value}`;
        }
        return this.append({ url });
    }
    async asText(ensureSuccess = true) {
        const { result } = await this.asTextResponse(ensureSuccess);
        return result;
    }
    async asBlob(ensureSuccess = true) {
        const { result } = await this.asBlobResponse(ensureSuccess);
        return result;
    }
    async asJson(ensureSuccess = true) {
        const { result } = await this.asJsonResponse(ensureSuccess);
        return result;
    }
    async asJsonResponse(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.json());
    }
    async asTextResponse(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.text());
    }
    asBlobResponse(ensureSuccess = true) {
        return this.execute(ensureSuccess, (x) => x.blob());
    }
    async execute(ensureSuccess = true, postProcessor) {
        let { log, logError } = this.request;
        try {
            const { headers } = this.request;
            const r = await fetch(this.request.url, this.request);
            if (ensureSuccess) {
                if (r.status > 300) {
                    log = logError;
                    log?.(`fetch: ${this.request.method ?? "GET"} ${this.request.url}`);
                    if (log && headers) {
                        for (const key in headers) {
                            if ((Object.hasOwn && Object.hasOwn(headers, key)) || headers.hasOwnProperty(key)) {
                                log?.(`${key}: ${headers[key]}`);
                            }
                        }
                    }
                    log?.(`${r.status} ${r.statusText || "Http Error"}`);
                    const type = r.headers.get("content-type");
                    if (/\/json/i.test(type)) {
                        const json = await r.json();
                        log?.(json);
                        const message = json.title
                            ?? json.detail
                            ?? json.message
                            ?? json.exceptionMessage
                            ?? "Json Server Error";
                        log = null;
                        logError = null;
                        throw new JsonError(message, json);
                    }
                    const text = await r.text();
                    log?.(text);
                    log = null;
                    logError = null;
                    throw new Error(`Failed for ${this.request.url}\n${text}`);
                }
            }
            log?.(`${this.request.method ?? "GET"} ${this.request.url}`);
            if (log && headers) {
                for (const key in headers) {
                    if ((Object.hasOwn && Object.hasOwn(headers, key)) || headers.hasOwnProperty(key)) {
                        log?.(`${key}: ${headers[key]}`);
                    }
                }
            }
            const result = await postProcessor(r);
            if (log) {
                log(`${r.status} ${r.statusText || "OK"}`);
                log(result);
            }
            return { result, headers: r.headers, status: r.status };
        }
        catch (error) {
            log?.(error);
            throw error;
        }
    }
    append(r) {
        // we will try to merge url here..
        let { url } = this.request;
        const { url: newUrl } = r;
        if (newUrl) {
            if (!url) {
                url = newUrl;
            }
            else {
                if (/^https?\:\/\//i.test(newUrl)) {
                    url = newUrl;
                }
                else {
                    url = (new URL(newUrl, url)).toString();
                }
            }
        }
        return new FetchBuilder({
            ...this.request,
            ...r,
            url
        });
    }
}
class JsonError extends Error {
    constructor(message, json) {
        super(message);
        this.json = json;
    }
}
FetchBuilder.JsonError = JsonError;
module.exports = FetchBuilder;
//# sourceMappingURL=index.js.map