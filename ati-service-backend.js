
require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var init = require('./config/init');
const fn = require('./utils/fn');
var config = require('./config')
var cron = require('node-cron')

var app = express();

app.use(cors({
  origin: config.origins,
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'pdf')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.port, function () {
  console.log(`Escuchando el puerto ${config.port}!`);

  // init.Start();
  // init.createUser();
  // init.createCustomer();
  // init.createProject();
  // init.createRole();
  // init.createMenu();
  // init.createConfiguration();
  // init.createAttentionType()
  init.updateCustomerToUsers()
});


let cronProcess = {
  semiAnnualMaintenance: {
    status: false,
    // times: '*/5 * * * * *'
    times: '*/5 * * * * *'
  }
}
cron.schedule(cronProcess.semiAnnualMaintenance.times, function () {
  if (cronProcess.semiAnnualMaintenance.status) {
    console.log(new Date());
    fn.semiAnnualMaintenance()
  }
})

module.exports = app;
