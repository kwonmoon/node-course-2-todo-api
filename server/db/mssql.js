const sql = require('mssql');

const { dbConfig } = require('./dbConfig');

var connPoolPromise = null;

function getConnPoolPromise() {
    if (connPoolPromise) {
        return connPoolPromise;
    }

    connPoolPromise = new Promise((resolve, reject) => {
        var conn = new sql.ConnectionPool(dbConfig);

        conn.on('close', () => {
            connPoolPromise = null;
        });

        conn.connect().then((pool) => {
            return resolve(pool);
        }).catch(err => {
            connPoolPromise = null;
            return reject(err);
        });
    });

    return connPoolPromise;
}

function executeQuery(query, callback) {
    getConnPoolPromise().then((pool) => {
        var sqlRequest = new sql.Request(pool);
        return sqlRequest.query(query);
    }).then(result => {
        callback(null, result);
    }).catch(err => {
        callback(err);
    });
}

function transactionQuery(query, callback) {
    getConnPoolPromise().then((pool) => {
        var transaction = new sql.Transaction(pool);

        transaction.begin(err => {
            if (err) {
                return callback(`Error in Transaction begin: ${err}`);
            }

            var sqlRequest = new sql.Request(transaction);
            sqlRequest.query(query, (err, result) => {
                if (err) {
                    return callback(`Error in SQL query: ${err}`);
                }

                transaction.commit(err => {
                    if (err) {
                        return callback(`Error in Transaction commit: ${err}`);
                    }

                    callback(null, result);
                });
            });
        });
    }).catch(err => {
        callback(err);
    });
}

module.exports = { executeQuery, transactionQuery }