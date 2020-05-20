// //使用mysql中间件连接MySQL数据库
module.exports = {
    mysql: {
        host:'localhost',           //数据库地址
        user: 'root',               //用户名
        password: 'root',           //密码
        port : '3306',              //端口
        database: 'jobmanage',      //库名
        dateStrings: true  //将时间转换为字符串
    }
  };