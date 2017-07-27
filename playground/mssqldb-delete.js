var db = require('./db');

db.tranxQuery(`DELETE FROM dbo.todos WHERE text = 'Eat lunch'`, (err, result) => {
    if (err) {
        console.log(`Unable to connect to Azure SQL Server: ${err}`);
    } else {
        console.log(JSON.stringify(result, undefined, 3));
    }
});