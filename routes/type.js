var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var conf = require('../conf/db');

var logger = require('../common/logger')

var typesql = require('../conf/type')

//通过连接池连接，这样可以出来高并发的情况，也不用去释放连接
var pool = mysql.createPool(conf.mysql)

/**
 *查询列表页
 */
router.get('/', function(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      //logger.error(err);
      res.send(false)
      return;
    }
    connection.query(typesql.queryAll,function(err,rows){
      if(err){
        //logger.error(err)
        res.send(false)
      }else {
        res.json(rows)
      }
    })
    // 释放连接
    connection.release();
  })
});


module.exports = router;