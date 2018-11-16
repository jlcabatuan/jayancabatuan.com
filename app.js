var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if(process.env.NODE_ENV == 'production') {
        var _path = path.normalize(path.join(__dirname, 'uploads'));
      } else {
        var _path = path.join(path.normalize('Z:/menlo'), 'uploads');
      }
      req.setTimeout(500000);
      console.log('uploading. setting timeout..');
      cb(null, _path); // Absolute path. Folder must exist, will not be created for you.
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.trim().replace(/[^a-zA-Z0-9 .]/g, '').split(' ').join('-'));
    }
})

const upload = multer({ storage: storage });


var routes = require('./routes/index');

var app = express();


app.use(cookieSession({
  name: 'session',
  keys: ['canon70d', 'canon6d']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    //helpers: require('./hbshelpers.js').helpers
}));

app.set('view engine', '.hbs');
app.set('view cache', true);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if(process.env.NODE_ENV == 'production') {
  app.use('/uploads', express.static(path.normalize(path.join(__dirname, 'uploads'))));
} else {
  app.use('/uploads', express.static(path.join(path.normalize('Z:/menlo'), 'uploads')));
}


/**
 * CORS support.
 */
app.all('/*', function (req, res, next) {
    // http://www.reddit.com/r/bestof/comments/2yyop7/rdiscworld_redditors_with_web_servers_start/
    // http://www.gnuterrypratchett.com/
    res.header('X-Clacks-Overhead', 'GNU Terry Pratchett');
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Authorization');
    // Disable cache
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    // IE Edge
    // res.header('X-UA-Compatible', 'IE=Edge');

    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.use(express.static(path.join(__dirname, 'public')));
// app.use(upload.single('file'));
app.use(upload.array('files', 10));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/npm', express.static(path.join(__dirname, 'node_modules')));

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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


module.exports = app;
