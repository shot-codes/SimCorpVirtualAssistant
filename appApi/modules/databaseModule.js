const mysql = require('mysql');
const util = require('util');

//Since SQL queries are a type-2 grammar it can't be validated completely using RegEx
//though here is a simple regex that catches most cases:
var regexSimpleSQLSelectQuery = RegExp('SELECT .* FROM DB_DATA( WHERE .*)?','i');

const con = mysql.createConnection({
    host: "remotemysql.com",
    user: "9nI7CV8RHw",
    password: "MtquOumHAk",
    database: "9nI7CV8RHw"
});

function makeConnectionToDB() {
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to Database!");
    });
}
makeConnectionToDB();
const queryUtil = util.promisify(con.query).bind(con);


function isValidSyntaxForQuery(query) {
    return regexSimpleSQLSelectQuery.test(query);
}

async function requestQuery(query) {
        if (isValidSyntaxForQuery(query)) {
            try {
                return await queryUtil(query);
            } catch (e) {
                throw e;
            }
        } else {
            throw new Error("query: " + query + " did not match regex");
        }
    }

module.exports.requestQuery = requestQuery;

