require('dotenv').config();
const express = require('express');

const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Server running</h1>");
});

app.listen(5000, (req, res) => {
    console.log("🚀 Server is up and running... \n✅ http://localhost:5000\n");
    //✅   http://localhost:4000/graphql\n\n
});
