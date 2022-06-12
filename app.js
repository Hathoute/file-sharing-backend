const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const apiRouter = require('./api/files');

const configValidator = require("./config/config_validator");
configValidator();

const app = express();

const env = process.env.NODE_ENV || 'development';
if(env === 'development') {
  // view engine setup (only used in development)
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
}

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/files/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if(req.app.get('env') === 'development') {
    next(createError(404));
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if(req.app.get('env') === 'development') {
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
