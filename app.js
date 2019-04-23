var express = require('express');
var path = require('path');
var cors = require('cors');


var indexRouter = require('./appApi');
var intentMatcherRouter = require('./appApi/modules/intentMatcher');


var app = express();

app.use(cors());

// view engine setup to make it possible to render plain html
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

//setup dir to search through when looking for files
app.use(express.static(path.join(__dirname, 'appWeb')));
// app.use(express.static(path.join(__dirname, 'public/images')));
// app.use(express.static(path.join(__dirname, 'public/javascripts')));


// app.use('jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));


app.use('/', indexRouter);
app.use('/users',intentMatcherRouter);


app.listen(8080, function() {console.log(`listening at the moment!`)});

module.exports = app;
