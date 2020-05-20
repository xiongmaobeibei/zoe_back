/*
  多container及多transport组合
 */
//winston记录错误日志
//Winston是Node.js最流行的日志框架之一，设计为一个简单通用的日志库，支持多传输（在Winston中，一个传输实质上代表储存设备，也就是数据最终保存在哪里），每个Winston实例都可以对不同级别的日志配置不同的传输。
var { createLogger, format, transports } = require('winston');
var { combine, timestamp, printf } = format;
var path = require('path');

var myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

var logger = createLogger({
  level: 'error',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new (transports.Console)(),
    new (transports.File)({
      filename: path.join(__dirname, '../log/error.log')
    })
  ]
});

module.exports = logger;
