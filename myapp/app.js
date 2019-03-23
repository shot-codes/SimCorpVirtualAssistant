var express = require('express');
var path = require('path');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup to make it possible to render plain html
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);

//setup dir to search through when looking for files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/javascripts')))

app.use('/', indexRouter);


app.listen(3000, function() {console.log(`listening at the moment!`)})

module.exports = app;