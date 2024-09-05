# Fetch Builder
Simple Fluent Interface to call fetch

# Why?
To make REST API easier. Lets have following examples.

## Download Text
```javascript
const text = await FetchBuilder.get("https://someurl.com")
    .asText();
```

## Post Json body and retrieve Json
```javascript
const result = await FetchBuilder.post("https://someapi.com")
    .header("x-api-key", someKey)
    .jsonBody({
        name: "bla bla bla",
        email: "bla@bla.bla"
    })
    .asJson<IResult>();
```

## Reuse builder

This is important as you can configure builder once with default headers.

```javascript

    const client = FetchBuilder
        .header("x-api-key", someKey);

    const result = await client.post("/api/orders/create")
        .jsonBody({
            productId: 3
        })
        .asJson<IResult>();

```

## Log Failed Requests

This will log only failed requests.

```javascript

    const client = FetchBuilder
        .header("x-api-key", someKey)
        .logWhenFailed(console.error);

    const result = await client.post("/api/orders/create")
        .jsonBody({
            productId: 3
        })
        .asJson<IResult>();

```
