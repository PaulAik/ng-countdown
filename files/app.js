var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var lessMiddleware = require('less-middleware');

var routes = require('./routes/index');
var presenter = require('./routes/presenter');

var app = express();
var server = http.createServer(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(lessMiddleware('/less', {
  dest: '/css',
  pathRoot: path.join(__dirname, 'public')
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/presenter', presenter);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(server);

var presenterSocket = null;

io.sockets.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });

  console.log('new person connected!');

  socket.on('presenter:join', function(data) {
    presenterSocket = socket;

    console.log('Presenter joined!');
  });

  socket.on('user:join', function(data) {
    console.log(data);

    presenterSocket.emit('user:join', { name: data.name });
  }); 

  socket.on('user:submit', function(data) {
    console.log("User submitting word");

    presenterSocket.emit('user:submit', data);
  });

  socket.on('game:letterselected', function(data) {
    console.log("New letter: " + data.letter);

    io.sockets.emit('game:letterselected', data); 
  });

  socket.on('game:countdown', function(data) {
    console.log("Time until start: " + data.seconds);

    io.sockets.emit('game:countdown', data); 
  });

  socket.on('game:round', function(data) {
    console.log("Time until round end: " + data.seconds);

    io.sockets.emit('game:round', data); 
  });

  socket.on('game:endround', function(data) {
    console.log("Round done!");

    io.sockets.emit('game:endround', data); 
  });

});

module.exports = app;
