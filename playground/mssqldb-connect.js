var db = require('./db');

// SELECT
db.query(`SELECT * FROM dbo.todoapp`, (err, result) => {
    if (err) {
        console.log(`Unable to connect to Azure SQL Server: ${err}`);
    }

    console.log(JSON.stringify(result.recordsets[0][0], undefined, 3));
});

// INSERT
var name = 'Daniel';
var age = 25;
var location = 'Portland';
db.tranxQuery(`INSERT INTO dbo.users(name,age,location) values ('${name}',${age},'${location}')`, (err, result) => {
    if (err) {
        console.log(`Unable to connect to Azure SQL Server: ${err}`);
    } else {
        console.log(JSON.stringify(result, undefined, 3));
    }
});