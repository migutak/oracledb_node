var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
var dbConfig = require('./dbconfig.js');

oracledb.getConnection(
  {
    user          : dbConfig.user,
    password      : dbConfig.password,
    connectString : dbConfig.connectString
  },
  function(err, connection) {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      `SELECT *
       FROM loans_stage offset 0 rows fetch next 2 rows only`,
      [],  // bind value for :id
      {},
      function(err, result) {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        // console.log(result.metaData);
        console.log(result.rows);
        doRelease(connection);
      });
  });

function doRelease(connection) {
  connection.close(
    function(err) {
      if (err)
        console.error(err.message);
    });
}