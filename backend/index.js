const express = require('express');
const path = require('path');
const app = express();

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(allowCrossDomain);


app.get("/test", (request, response) => {
    response.sendFile(__dirname + "/public/test.html");
});

const products = [
    {
        id: 0, text: "куриное филе", count: 1
    },
    {
        id: 1, text: "яблоки", count: 5
    },
    {
        id: 2, text: "творог", count: 3 
    }
];

const isDefined = value => value !== undefined && value !== null;

app.get("/products", (request, response) => {
    response.set({
        'Access-Control-Allow-Origin': '*'
    })
    response.json(products);
});


app.post("/products", (request, response) => {
    response.set({
        'Access-Control-Allow-Origin': '*'
    })
    const id = products[products.length - 1].id + 1;
    if (!isDefined(request.body.text)) {
        response.status(400).send("Item must contain text field");
        return;
    }
    if (!isDefined(request.body.count)) {
        response.status(400).send("Item must contain count field");
        return;
    }
    products.push({
        text: request.body.text,
        count: request.body.count,
        id
    });
    response.json({ id });
});

app.put("/products/:id", (request, response) => {
    response.set({
        'Access-Control-Allow-Origin': '*'
    })
    const selectedItemId = request.params.id;
    const selectedItem = products.find(item => item.id === +selectedItemId);
    if (!selectedItem) {
        response.status(400).send("Item not found");
        return;
    }

    if (isDefined(request.body.text)) {
        selectedItem.text = request.body.text;
    }
    if (isDefined(request.body.count)) {
        selectedItem.count = request.body.count;
    }
    response.status(200).send("ok");
});

app.delete("/products/:id", (request, response) => {
    response.set({
        'Access-Control-Allow-Origin': '*'
    })
    const selectedItemId = request.params.id;
    const selectedItemIndex = products.findIndex(item => item.id === +selectedItemId);
    if (selectedItemIndex === -1) {
        response.status(400).send("Item not found");
        return;
    }
    products.splice(selectedItemIndex, 1);
    response.status(200).send("ok");
});

app.listen(3030, () => {
    console.log("check out the magic at: http://localhost:3030")
})
