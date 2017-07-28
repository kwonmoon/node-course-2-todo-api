var express = require('express');
var bodyParser = require('body-parser');

var { executeQuery } = require('./db/mssql');
var { transactionQuery } = require('./db/mssql');

var app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var query = `INSERT INTO dbo.todos(text) VALUES('${req.body.text}');`;
    transactionQuery(query, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.send(result);
    });
});

app.get('/todos', (req, res) => {
    var query = `SELECT * FROM dbo.todos;`;
    executeQuery(query, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }
        var todos = result.recordset;
        res.send({ todos });
    });
});

app.get('/todos/:id', (req, res) => {
    // check if params id contains only numbers
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).send();
    }
    var id = parseInt(req.params.id);
    var query = `SELECT * FROM dbo.todos WHERE id = ${id}`;
    executeQuery(query, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }

        var todos = result.recordset;

        if (todos.length === 0) {
            return res.status(400).send();
        }

        res.send({ todos });
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = { app };