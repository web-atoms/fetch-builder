const FetchBuilder = require("./index.js");

const root = FetchBuilder.url("https://reqbin.com/echo/");

root.post("./post/json")
    .jsonBody({
        "Id": 78912,
        "Customer": "Jason Sweet",
        "Quantity": 1,
        "Price": 18.00
    })
    .asJson()
    .then((r) => console.log(r));
    