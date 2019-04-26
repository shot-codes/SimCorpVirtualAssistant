const mysql = require('mysql');
const visualisationModule = require('./dataVisualisationModule');
const util = require('util');

const con = mysql.createConnection({
    host: "remotemysql.com",
    user: "yiZaQZM5Nm",
    password: "L3YF0CxQf7",
    database: "yiZaQZM5Nm"
});
const conQuery = util.promisify(con.query).bind(con); // Convert 'con.query' to async function returning a promise. 

function makeConnectionToDB() {
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to Database!");
    });
}
makeConnectionToDB();


var ExportObject = {

    queryDBTable: function (res, query) {
        con.query(query, function (err, data) {
            if (err) throw err;
            res.render('tableTemplate.ejs', { results: data }); // TODO: Use Aync/Await to send data to index.js and render there
        });
    },

    queryDBGraph: async function (query) {
        try {
            const result = await conQuery(query);
            let modifiedData = visualisationModule.formatData(result);
            return modifiedData
        } finally {
            con.end();
        }
    },

    queryTableSuperuser: function(res, query) {
        con.query(query, function (err, data) {
            if (err) throw err;
            res.render('tableTemplate.ejs', { results: data });
        });
    }
};

module.exports.functions = ExportObject;

