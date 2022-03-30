//importing connection object for dealing with the DB
var dbConnection = require('./dbConnection');
var dbConfig = require('../../config/dbconfig');


function DbTransaction() {
    this.connection = dbConnection;
}

//sql query for appending row data in to a table
DbTransaction.prototype.addRow = function(table_name, cols, values, callback) {
    var statement = `INSERT INTO ${table_name}(`;
    //appending col names to the statement

    cols.forEach(col => {
        statement += col + ",";
    });
    statement = statement.substr(0, statement.length - 1) + ") VALUES (";
    values.forEach(val => {
        statement += "'" + val + "'" + ",";
    });

    statement = statement.substr(0, statement.length - 1) + ")";
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        callback(null, results);
    });
}

DbTransaction.prototype.deleteRow = function(table_name, conditon, callback) {

    var statement = `DELETE FROM ${table_name} WHERE ${conditon}`;
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        callback(null, results);
    });

}

DbTransaction.prototype.updateRow = function(table_name, cols, values, conditon, callback) {
    var statement = `UPDATE ${table_name} SET `;
    //appending col names and corresponding values to the statement
    for (idx in cols) {
        statement += cols[idx] + " = " + " '" + values[idx] + "',";
    }
    statement = statement.substr(0, statement.length - 1);
    if (conditon)
        statement += ` WHERE ${conditon}`;
    console.log(statement);
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        callback(null, results);
    });

}

DbTransaction.prototype.selectAllRow = function(table_name, callback, cols) {

    var statement = `SELECT `;
    //check if any columns are specified
    if (!cols) statement.concat(` * FROM ${table_name} WHERE 1`);
    else {
        cols.forEach(col => {
            statement += col + ",";
        });
        statement = statement.substr(0, statement.length - 1).
        concat(` FROM ${table_name} WHERE 1`);
    }
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        callback(null, results);
    });
}
DbTransaction.prototype.searchTable = function(table_name, condition, callback) {
    var statement = `SELECT * FROM ${table_name} WHERE ${condition}`;
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        return callback(null, results);
    });
}

DbTransaction.prototype.selectSingleRow = function(table_name, condition, callback, cols) {

    var statement = `SELECT `;
    if (cols) {
        cols.forEach(col => {
            statement += col + ",";
        });
        if (condition.startsWith(" INNER") || condition.startsWith(" LEFT")) {
            statement = statement.substr(0, statement.length - 1).
            concat(` FROM ${table_name} ${condition}`);
        } else {
            statement = statement.substr(0, statement.length - 1).
            concat(` FROM ${table_name} WHERE ${condition}`);
        }
    } else {
        statement += `* FROM ${table_name} WHERE ${condition}`;
    }
    console.log(statement);
    this.connection.query(statement, (err, results, fields) => {
        if (err) callback(err);
        callback(null, results);
    });
}

module.exports = new DbTransaction();