var express = require('express');
var bodyParser = require('body-parser');

var { executeQuery } = require('./db/mssql');
var { transactionQuery } = require('./db/mssql');

var app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var query = `INSERT INTO dbo.todos(text) VALUES('${req.body.text}');`;
    executeQuery(query, (err, result) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.send(result);
        }
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});