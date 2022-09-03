
require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const http = require('http');
const socketIO = require('socket.io');
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var init = require('./config/init');
const fn = require('./utils/fn');
var config = require('./config')
var cron = require('node-cron')
const jwt_decode = require("jwt-decode");
var app = express();
var schemas = require("./db/schemas");
const notification = require('./utils/notification');
const { log } = require('console');


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
app.use(express.static(path.join(__dirname, 'excel')));

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

let cronProcess = {
  semiAnnualMaintenance: {
    status: false,
    // times: '*/5 * * * * *'
    times: '*/10 * * * * *'
  }
}
cron.schedule(cronProcess.semiAnnualMaintenance.times, function () {
  if (cronProcess.semiAnnualMaintenance.status) {
    console.log(new Date());
    fn.semiAnnualMaintenance()
  }
})




console.log(config)
const server = http.Server(app);
const io = socketIO(server)
var nsp = io.of(config.namespace)

server.listen(config.port, async function () {
  console.log(`Escuchando el puerto ${config.port}!`);

  // init.MaintenanceType()
  // init.Start();
  // init.createUser();
  // init.createCustomer();
  // init.createMaintenances();
  // init.createRole();
  init.createMenuWeb();
  init.createMenuMobile();
  // init.createConfiguration();
  // init.createAttentionType()
  // init.updateCustomerToUsers()
  // init.UpdateProjectSetNewItems();
  // init.NewItem();
  // init.NewItemFinding()
  // init.createRequestType();
  // init.setItemBoardToDefault()
  // init.setItemImagesToDefault()
  // init.CopperAluminumTable()
  // init.addItemBoard1()
  // init.addItemBoard2()


});
nsp.on('connection', socket => {
  console.log("SocketID : " + socket.id)
  if (socket.handshake.query.token !== "null" || socket.handshake.headers.token !== "null") {
    let user = jwt_decode(socket.handshake.query.token ? socket.handshake.query.token : socket.handshake.headers.token)
    console.log(user);
    socket.join(user.id)
    socket.join(user.username)
    socket.join(user.role.tag)
    console.log('--------------------------------------')
    console.log('Cliente connected : ' + socket.id)
    console.log('--------------------------------------\n')
  }
  socket.on('createRequest', async data => {

    var adminUsers = await schemas.User.aggregate([{
      $project: { username: 1, tokenFCM: 1, role: 1 }
    }, {
      $lookup: {
        from: "roles",
        localField: "role",
        foreignField: "_id",
        as: "role"
      }
    }, { $unwind: { path: "$role" } }, { $match: { "role.tag": "administrator" } }
    ])


    switch (data.user.role.tag) {
      case 'administrator':
      case 'technical':

        var foundUsers = await schemas.User.find().where('_id').in(data.centerOfAttention.users);
        var users = foundUsers.filter(user => user.tokenFCM);
        var tokens = users.map(user => user.tokenFCM);

        var usernames = adminUsers.map(user => user.username);


        setTimeout(() => {

          console.log('usernames', usernames);
          usernames.forEach(username => {
            nsp.to(username).emit('onCreateRequest', {});

          });
          // notification.sendNotification(tokens, 'Solicitud creada', `[${data.request_type.type}] ${data.description}`, {});
        }, 4000);

        break;

      default:

        var users = adminUsers.filter(user => user.tokenFCM);
        var ids = users.map(user => user.tokenFCM);

        setTimeout(() => {
          notification.sendNotification(ids, 'Solicitud creada', `[${data.request_type.type}] ${data.description}`, {});

        }, 4000);
        break;
    }
  })
  socket.on('acceptRequest', async data => {
    console.log("::::::::::::::::::::::: Request ::::::::::::::::::::");
    console.log(data);
  })
  socket.on('updateMenu', async data => {
    let role = await schemas.Role.findById(data.idrole);
    nsp.to(role.tag).emit('onUpdateMenu', {});
  })

})
module.exports = app;
