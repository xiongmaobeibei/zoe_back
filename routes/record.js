var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var conf = require('../conf/db');

//外部插件
var uuid = require('node-uuid')
var moment = require('moment')

var logger = require('../common/logger')

var jobsql = require('../conf/job')
var recordsql = require('../conf/record')

//通过连接池连接，这样可以出来高并发的情况，也不用去释放连接
var pool = mysql.createPool(conf.mysql)


/**
 * 查询所有记录
 */
router.get('/',function(req,res,next){
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.err(err);
            return;
        }
        connection.query(recordsql.queryAll,function(err,rows){
            if(err) {
              logger.error(err)
              res.send(false)
            }
            else res.json(rows)
        })
        // 释放连接
        connection.release();
    })
})

/**
 * 任务列表增加一条记录
 */
router.get('/insert',function(req,res,next){
    pool.getConnection(function (err, connection) {
        if (err) {
            logger.err(err);
            return;
        }
        var tid = uuid.v1()
        var nowtime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        var params = req.body
        connection.query(recordsql.insertRecord, [tid, params, nowtime, nowtime], function(err,rows){
            if(err) {
              logger.error(err)
              res.send(false)
            }
            //else res.json(rows)
            res.send(true)
        })
        // 释放连接
        connection.release();
    })
})

/**
 * 传两个字符串，一个是用户Id，一个是日期
 */
router.get('/queryByUser',function(req,res,next){
  pool.getConnection(function (err, connection) {
      if (err) {
          logger.err(err);
          return;
      }
      var params = req.body
      connection.query(recordsql.queryByUser, [params.userId,params.dateTime,params.dateTime,params.dateTime], function(err,rows){
          if(err) {
            logger.error(err)
            res.send(false)
          }
          //else res.json(rows)
          else res.send(true)
      })
      // 释放连接
      connection.release();
  })
})



/**
* 任务已完成
***增加多条record记录
***改repeat=1任务的状态为2
*/
router.post('/updateFinished', function (req, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error(err);
        res.send(false)
        return;
      }
  
      const { taskIdList, timeList } = req.body
      
      const searchTaskByIds = (taskIds) => new Promise((resolve, reject) => {
        const strTaskIds = taskIds.join(',')
        connection.query(jobsql.queryByIds, strTaskIds, (err, rows) => {
          if (rows && rows.length > 0 && rows[0]) {
            resolve(rows[0])
          } else {
            reject(err)
            logger.error(err)
          }
        });
      })
  
      const finishedTaskByIds = (taskIds) => new Promise((resolve, reject) => {
        const strTaskIds = taskIds.join(',')
        connection.query(jobsql.updateStatusByIds, [2, strTaskIds], (err, rows) => {
          if (rows && rows.affectedRows > 0) {
            resolve(true)
          } else {
            reject(err)
            logger.error(err)
          }
        });
      })
  
      const addTaskRecords = (taskRecords) => new Promise((resolve, reject) => {
        // var tid = uuid.v1()
        // var params = [tid, taskId, endTime, startTime]
        connection.query(recordsql.insertRecords, taskRecords, function (err, rows) {
          if (rows && rows.affectedRows > 0) {
            resolve(true)
          } else {
            reject(err)
            logger.error(err)
          }
        });
      })

      // 获取不重复任务
      let noRepeats = []
      let recordList = []
      // 通过id获取所有的任务
      const taskList = searchTaskByIds(taskIdList)
      taskList.forEach((tItem) => {
        if (tItem.repeatType === 1) {
          noRepeats.push(tItem)
        }
        timeList.forEach((timeItem, timeIndex) => {
          const { startTime, endTime } = timeItem
          recordList.push([`${uuid.v1()}_${timeIndex}`, tItem.id, startTime, endTime])
        })
      })
      // 更新所有不重复的任务状态 为 2
      await finishedTaskByIds(noRepeats)
      // 批量添加记录
      await addTaskRecords(recordList)
      // 释放连接
      connection.release();
    })
  });

/**
* 任务取消已完成
***删除该任务id的相关当天任务记录
***改repeat=1任务的状态为1
*/
router.post('/cancelFinished', function (req, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        logger.error(err);
        res.send(false)
        return;
      }
  
      const { taskId, time } = req.body
      
      const searchTaskById = (taskId) => new Promise((resolve, reject) => {
        connection.query(jobsql.queryById, taskId, (err, rows) => {
          if (rows && rows.length > 0 && rows[0]) {
            resolve(rows[0])
          } else {
              console.log('1')
            reject(err)
            logger.error(err)
            res.send(false)
          }
        });
      })
  
      const cancelTaskById = (taskId) => new Promise((resolve, reject) => {
        connection.query(jobsql.updateStatus, [1, taskId], (err, rows) => {
          if (rows && rows.affectedRows > 0) {
            resolve(true)
          } else {
            console.log('2',rows)
            reject(err)
            logger.error(err)
            res.send(false)
          }
        });
      })
  
      const delTaskRecord = (taskId, time) => new Promise((resolve, reject) => {
        var stime = time+' 00:00:00'
        var etime = time+' 23:59:59'
        var params = [taskId,stime,etime]
        console.log(params)
        connection.query(recordsql.deleteRecord, params, function (err, rows) {
          if (rows) {
            resolve(true)
          } else {
            console.log('3')
            reject(err)
            logger.error(err)
            res.send(false)
          }
        });
      })

      Promise.all([searchTaskById(taskId),cancelTaskById(taskId),delTaskRecord(taskId,time)])
      // 释放连接
      connection.release();
    })
  });

module.exports = router;