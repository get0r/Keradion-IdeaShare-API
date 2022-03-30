//loading DB credentials..
var dbConfig = require('../../config').dbConfig;
//MYSQL DB driver for node.
var MySQL = require('mysql');

//connecting to MYSQL databse using credentials.
//1-- creating connection.

const dbConnection = MySQL.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB_NAME
});

//2-- opening connection using credentials.

dbConnection.connect(err => {
    if (err) throw err;
    console.log("Connected to the database.");
});

//3-- exporting the connection object for manipulating data.

module.exports = dbConnection;