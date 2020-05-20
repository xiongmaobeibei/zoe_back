var createError = require('http-errors');
var express = require('express');//加载express模块
var path = require('path');//路径模块
var cookieParser = require('cookie-parser');//这就是一个解析Cookie的工具。通过req.cookies可以取到传过来的cookie，并把它们转成对象。
var logger = require('morgan');//在控制台中，显示req请求的信息
var bodyParser = require('body-parser');//node.js 中间件，用于处理 JSON, Raw, Text 和 URL 编码的数据。

// 路由信息（接口地址），存放在routes的根目录
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jobsRouter = require('./routes/jobs');
var repeatRouter = require('./routes/repeat');
var typeRouter = require('./routes/type');
var recordRouter = require('./routes/record')

var app = express();

// 模板开始
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 载入中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 配置路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/jobs', jobsRouter);
app.use('/repeat', repeatRouter);
app.use('/type', typeRouter);
app.use('/record', recordRouter);

// 输出日志到目录
var fs = require('fs');
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/log/request.log'), { flags: 'a', encoding: 'utf8' }); 
app.use(logger('combined', { stream: accessLogStream }));


// 错误处理
app.use(function(req, res, next) {
  //next(createError(404));
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//允许跨域请求设置
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

module.exports = app;
