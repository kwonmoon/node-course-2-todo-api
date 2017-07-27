var db = require('./db');

// SELECT
db.query(`SELECT * FROM dbo.todos WHERE completed = 'N'`, (err, result) => {
    if (err) {
        return console.log(`Unable to connect to Azure SQL Server: ${err}`);
    }
    console.log('Todos');
    console.log(JSON.stringify(result.recordsets[0], undefined, 3));
});