const { default: FetchBuilder } = require("./index.js");

FetchBuilder.post("https://reqbin.com/echo/post/json")
    .jsonBody({
        "Id": 78912,
        "Customer": "Jason Sweet",
        "Quantity": 1,
        "Price": 18.00
    })
    .asJson()
    .then((r) => console.log(r));
    