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
      res.send(false)
      return;
    }
    connection.query(jobsql.queryAll,function(err,rows){
      if(err){
        logger.error(err)
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
  if (params.repeatType != null) {
    querySql = querySql + ' and repeatType=?'
    dataParams.push(params.repeatType)
  }
  if (params.createTime != null) {
    querySql = querySql + ' and year(createTime)=year(?) and month(createTime)=month(?) and day(createTime)=day(?)'
    dataParams.push(params.createTime)
    dataParams.push(params.createTime)
    dataParams.push(params.createTime)
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
      res.send(false)
      return;
    }
    connection.query(querySql,dataParams,function(err,rows){
      if(err){
        logger.error(err)
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
* 新建任务
*/
router.post('/add', function(req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      logger.error(err);
      res.send(false)
    }
    var params = req.body.jobs
    var tid = uuid.v1()
    var nowtime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    var addParams = [tid, params.userId, params.name, params.taskType, params.repeatType, nowtime,params.tags, params.dateTime, 1]
    connection.query(jobsql.insert,addParams,function(err,rows){
      if(err){
        logger.error(err)
        res.send(false)
      }else {
        res.send(true)
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
      res.send(err)
      return;
    }
    var params = req.body.jobs
    console.log(params)
    connection.query(jobsql.update,[params.name, params.taskType, params.dateTime, params.tags, params.repeatType, params.userId,params.status, params.id],function(err,rows){
      if(err){
        logger.error(err)
        res.send(err)
      }else {
        res.json(rows)
        //res.send(true)
      }
    })
    // 释放连接
    connection.release();
  })
});


module.exports = router;