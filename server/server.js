const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

var { executeQuery } = require('./db/mssql');
var { transactionQuery } = require('./db/mssql');

var app = express();
const port = process.env.PORT || 3000;

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

        var todo = result.recordset;

        if (todo.length === 0) {
            return res.status(404).send();
        }

        res.send({ todo: todo });
    });
});

app.delete('/todos/:id', (req, res) => {
    // check if params id contains only numbers
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).send();
    }

    var id = parseInt(req.params.id);
    var query = `DELETE FROM dbo.todos WHERE id = ${id}`;
    transactionQuery(query, (err, result) => {
        if (err) {
            console.log('err:', err);
            return res.status(400).send(err);
        }

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({
                message: `Not delete - ID ${id} doesn't exist`
            });
        }

        res.status(200).send({
            message: `ID ${id} deleted`
        });
    });
});

app.patch('/todos/:id', (req, res) => {
    // check if params id contains only numbers
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).send();
    }

    var id = parseInt(req.params.id);
    var body = _.pick(req.body, ['text', 'completed']);

    var query = `UPDATE dbo.todos
                    SET text = '${body.text}'
                      , completed = '${body.completed}'
                  WHERE id = ${id};`

    transactionQuery(query, (err, result) => {
        if (err) {
            console.log('err:', err);
            return res.status(400).send(err);
        }

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({
                message: `Not updated - ID ${id} doesn't exist`
            });
        }

        res.status(200).send({
            message: `ID ${id} updated`
        });
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };