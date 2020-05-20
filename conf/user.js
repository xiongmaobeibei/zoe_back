// dao/userSqlMapping.js
// CRUD SQL语句
var user = {
    insert: 'insert into t_user(id, phone, name, password, resignDate, pic) VALUES(?,?,?,?,?,?)',
    update: 'update t_user set name=?, password=? where phone=?',
    delete: 'delete from t_user where FIND_IN_SET(phone,?)',
    queryByTel: 'select * from t_user where phone=?',
    queryAll: 'select * from t_user'
  };
  
  module.exports = user;