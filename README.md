# Fetch Builder
Simple Fluent Interface to call fetch

# Why?

```javascript
const text = await FetchBuilder.get("https://someurl.com")
    .responseAsText();
```

```javascript
const result = await FetchBuilder.post("https://someapi.com")
    .header("x-api-key", someKey)
    .jsonBody({
        name: "bla bla bla",
        email: "bla@bla.bla"
    })
    .responseAsJson<IResult>();
```
Reuse builder.
```javascript

    const client = FetchBuilder
        .header("x-api-key", someKey);

    const result = await client.post("/api/orders/create")
        .jsonBody({
            productId: 3
        })
        .responseAsJson<IResult>();

```
