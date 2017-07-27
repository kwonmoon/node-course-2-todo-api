const sql = require('mssql');

const config = {
    user: 'chcp_admin',
    password: 'Sung#01Jin',
    server: 'chcp.database.windows.net',
    database: 'chcapital',
    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
};

var connPoolPromise = null;

function getConnPoolPromise() {
    if (connPoolPromise) {
        return connPoolPromise;
    }

    connPoolPromise = new Promise((resolve, reject) => {
        var conn = new sql.ConnectionPool(config);

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

module.exports.query = (sqlQuery, callback) => {
    getConnPoolPromise().then((pool) => {
        var sqlRequest = new sql.Request(pool);
        return sqlRequest.query(sqlQuery);
    }).then(result => {
        callback(null, result);
    }).catch(err => {
        callback(err);
    });
};

module.exports.tranxQuery = (sqlQuery, callback) => {
    getConnPoolPromise().then((pool) => {
        var transaction = new sql.Transaction(pool);

        transaction.begin(err => {
            if (err) {
                callback(`Error in Transaction begin: ${err}`);
                return;
            }

            var sqlRequest = new sql.Request(transaction);
            sqlRequest.query(sqlQuery, (err, result) => {
                if (err) {
                    callback(`Error in SQL query: ${err}`);
                    return;
                }

                transaction.commit(err => {
                    if (err) {
                        callback(`Error in Transaction commit: ${err}`);
                        return;
                    }
                    console.log('Transaction committed.');
                    callback(null, result);
                });
            });
        });
    }).catch(err => {
        callback(err);
    });
};