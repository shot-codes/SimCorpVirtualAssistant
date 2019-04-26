const express = require('express');
const path = require('path');
// const najax = require('najax');
const dialogflow = require(path.resolve(__dirname, "./modules/dialogflowInterfaceModule"));
const database = require(path.resolve(__dirname, "./modules/databaseModule"));
const documentSearch = require(path.resolve(__dirname, "./modules/documentSearch"));
const superuserCommandHandler = require(path.resolve(__dirname, "./modules/superuserModule"));
const dialogflowHandler = require(path.resolve(__dirname, "./modules/dialogflowResponseHandlerModule"));

const router = express.Router();


router.get('/api/chatBotQueryManager/:query', function (req,res) {
    dialogflow.send(req.params.query)
    .then((data) => {
        dialogflowHandler.resolve(data)
    .then((result) => {
        console.log('index.js:20\n ',result);
        res.send(result);
        });
    });
});

router.get('/api/superuser/:query', function(req, res) {
    const commandOutput = superuserCommandHandler.handler(req.params.query, res);
    if (req.params.query.replace(/ .*/,'') !== "tableQuery") // TODO: Perhaps we should unify methods to render to the superuser output
        res.render('superuserTemplate.ejs', {results: commandOutput});
});

router.get('/api/search/:query', function(req, res) {
    const fuse = documentSearch.fuse;
    const fuseResponse = fuse.search(req.params.query);
    res.render('searchTemplate.ejs', {results: fuseResponse});
});

router.get('/api/graph/:query', function(req, res) {
    database.functions.queryDBGraph(req.params.query).then((data) => {
        console.log('index.js:\n ', data);
        res.render('graphTemplate.ejs', {results: data});
    });
});

router.get('/api/table/:query', function(req, res) {
    database.functions.queryDBTable(res,req.params.query);
});

router.get('/', function(req, res) {
    res.render('client.html');
});

router.get('/superuser', function(req, res) {
    res.render('superuser.html');
});

router.get('/docs', function(req, res) {
    res.render('docs.html');
});

router.get('/about', function(req, res) {
    res.render('about.html');
});


module.exports = router;

