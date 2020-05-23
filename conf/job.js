// dao/userSqlMapping.js
// CRUD SQL语句
var job = {
  //task中的sql语句
  //新建任务
    insert: 'insert into t_task(id, userId, name, taskType, repeatType, createTime, tags, dateTime, status) VALUES(?,?,?,?,?,?,?,?,?)',
  //编辑任务  
    update: 'update t_task set name=?, taskType=?, dateTime=?, tags=?, repeatType=?, userId=?, status=? where id=?',
  //删除任务  1-未完成 2-已完成 3-过期
    updateStatus: 'update t_task set status=? where id=?',
    updateStatusByIds: 'update t_task set status=? where id in (?)',
    updateStatusByR: 'update t_task set status = CASE repeatType WHEN 1 THEN ? ELSE 1 END where id in (?)',
  //根据用户和日期以及重复方式查询所有任务
    queryByUser: 'select * from t_task where userId=?',
  //查询所有任务
    queryAll: 'select * from t_task',
  //根据Id查找
    queryById: 'select * from t_task where id=?',
  // 根据id查找多条记录
    queryByIds: 'select * from t_task where id in (?)'
  };
  
  module.exports = job;