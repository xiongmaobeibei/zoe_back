var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var conf = require('../conf/db');

//外部插件
var uuid = require('node-uuid')
var moment = require('moment')

var logger = require('../common/logger')

var jobsql = require('../conf/job')

//通过连接池连接，这样可以出来高并发的情况，也不用去释放连接
var pool = mysql.createPool(conf.mysql)

/**
 *查询列表页
 */
router.get('/', function(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error(err);
      return;
    }
    connection.query(jobsql.queryAll,function(err,rows){
      if(err){
        logger.error(err)
      }else {
        res.json(rows)
      }
    })
    // 释放连接
    connection.release();
  })
});
/**
 *根据各种方法查询列表页
 */
router.get('/query', function(req, res, next) {
  var params = req.query
  var querySql = jobsql.queryByUser
  var dataParams = [params.userId]
  if (params.taskType != null) {
    querySql = querySql + ' and taskType=?'
    dataParams.push(params.taskType)
  }
  if (params.startTime != null) {
    querySql = querySql + ' and startTime=?'
    dataParams.push(params.startTime)
  }
  if (params.repeatType != null) {
    querySql = querySql + ' and repeatType=?'
    dataParams.push(params.repeatType)
  }
  if (params.dateTime != null) {
    querySql = querySql + ' and year(dateTime)=year(?) and month(dateTime)=month(?) and day(dateTime)=day(?)'
    dataParams.push(params.dateTime)
    dataParams.push(params.dateTime)
    dataParams.push(params.dateTime)
  }
  if (params.status != null) {
    querySql = querySql + ' and status=?'
    dataParams.push(params.status)
  }
  console.log(querySql)
  console.log(dataParams)
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error(err);
      return;
    }
    connection.query(querySql,dataParams,function(err,rows){
      if(err){
        logger.error(err)
      }else {
        res.json(rows)
      }
    })
    // 释放连接
    connection.release();
  })
});
/**
* 新建任务
*/
router.post('/add', function(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error(err);
    }
    var params = req.body.jobs
    var tid = uuid.v1()
    var nowtime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    var addParams = [tid, params.userId, params.name, params.taskType, params.startTime, params.repeatType, params.tags, nowtime, params.status]
    connection.query(jobsql.insert,addParams,function(err,rows){
      if(err){
        logger.error(err)
      }else {
        res.json(rows)
      }
    })
    // 释放连接
    connection.release();
  })
});

/**
 * 更新修改任务的时候需要将一整个对象传输过来
 * 允许接受对象数组jobs
 */
router.post('/update',function(req,res,next){
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error(err);
      return;
    }
    // var allParams = req.body.jobs
    // var i = allParams.length
    // for(m=0;m<i;m++){
    //   var params = allParams[m]
    //   connection.query(jobsql.update,[params.name, params.taskType, params.startTime, params.tags, params.repeattype, params.status, params.id],function(err,rows){
    //     if(err){
    //       logger.error(err)
    //     }else {
    //       res.json(rows)
    //     }
    //   });
    // }
    var params = req.body.jobs
    console.log(params)
    connection.query(jobsql.update,[params.name, params.taskType, params.startTime, params.tags, params.repeattype, params.status, params.id],function(err,rows){
      if(err){
        logger.error(err)
      }else {
        res.json(rows)
      }
    })
    // 释放连接
    connection.release();
  })
});


module.exports = router;