var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var conf = require('../conf/db');

//外部插件
var uuid = require('node-uuid')
var moment = require('moment')

var logger = require('../common/logger')

var usersql = require('../conf/user')

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
    connection.query(usersql.queryAll,function(err,rows){
      if(err){
        //logger.error(err)
        res.send(false)
      }else {
        res.json(rows)
      }
    });
    // 释放连接
    connection.release();
  })
});

/**
* 根据手机号找用户
*/
router.get('/queryByTel', function(req, res, next) {
  var phone = req.query.phone
  pool.getConnection(function (err, connection) {
    if (err) {
      //logger.error(err);
      res.send(false)
    }
    connection.query(usersql.queryByTel,phone,function(err,rows){
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

/**
 * 添加用户
 */
router.post('/add',function(req,res,next){
  pool.getConnection(function (err, connection) {
    if (err) {
      //logger.error(err);
      res.send(false)
      return;
    }
    var params = req.body.users
    var uid = uuid.v1()
    var nowtime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    connection.query(usersql.insert,[uid, params.phone, params.name, params.password, nowtime, params.pic],function(err,rows){
        if(err){
          //logger.error(err)
          res.send(false)
        }else {
          res.send(true)
        }
    })
    // 释放连接
    connection.release();
  })
});

// /**
// * 删除用户
// */
router.get('/delete', function(req, res, next) {
  var phone = req.query.phone
  pool.getConnection(function (err, connection) {
    if (err) {
      //logger.error(err);
      res.send(false)
    }
    connection.query(usersql.delete,phone,function(err,rows){
      if(err){
        //logger.error(err)
        res.send(false)
      }else {
        res.send(true)
      }
    })
    // 释放连接
    connection.release();
  })
});

// /**
// * 修改
// */
router.post('/update',function(req,res,next){
  var params = req.body.users
  pool.getConnection(function(err,connection){
    if (err) {
      //logger.error(err);
      res.send(false)
    }
    var reqbody = [params.name, params.password, params.phone]
    console.log(params)
    connection.query(usersql.update,reqbody,function(err,rows){
      if(err){
        //logger.error(err)
        res.send(false)
      }else {
        res.send(true)
      }
    })
    // 释放连接
    connection.release();
  })
})



module.exports = router;