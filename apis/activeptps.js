var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('../dbconfig.js');

const router = express.Router();

function doRelease(connection) {
  connection.close(
    function (err) {
      if (err)
        console.error(err.message);
    });
}

router.get("/active", (req, res, next) => {
  let accnumber = req.query.accnumber;

  var sql = "select * from ptps where accnumber = '" + accnumber + "' and promisedate > sysdate and lower(met) = 'not met'";
  oracledb.getConnection({
    user: dbConfig.user,
    password: dbConfig.password,
    connectString: dbConfig.connectString
  }, function (err, connection) {
    if (err) throw err;
    connection.execute(sql, function (error, result) {
      if (error) throw error;
      // console.log(result);
      res.status(200).json({
        message: "success",
        data: result.rows
      });
    });
    // doRelease(connection);
  });
});

module.exports = router;