// dao/userSqlMapping.js
// CRUD SQL语句
var record = {
    //taskrecord的sql语句
    //查询所有任务记录
      queryAll: 'select * from t_taskrecord',
    //新增任务记录
      insertRecord: 'insert into t_taskrecord(id, taskId, endTime, startTime) VALUES(?,?,?,?)',
    //删除任务记录
      deleteRecord: 'delete from t_taskrecord where FIND_IN_SET(taskId,?) and startTime>=? and startTime<=?',
    //根据用户和日期查询数据
      queryByUser: 'select t_taskrecord.* from t_taskrecord left join t_task on t_taskrecord.taskId=t_task.id where t_task.userId=? and year(t_taskrecord.startTime)=year(?) and month(t_taskrecord.startTime)=month(?) and day(t_taskrecord.startTime)=day(?)'
    };
    
    module.exports = record;