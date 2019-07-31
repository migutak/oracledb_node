var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('../dbconfig.js');
var async = require('async');

const router = express.Router();

var doconnect = function (cb) {
  oracledb.getConnection(
      {
          user: dbConfig.user,
          password: dbConfig.password,
          connectString: dbConfig.connectString
      },
      cb);
};

var dorelease = function (conn) {
  conn.close(function (err) {
      if (err)
          console.error(err.message);
  });
};

router.get("/all", (req, res, next) => {

  var sql = "select * from tbl_s_plans";

  var select_splans = function (conn, cb) {
    conn.execute(sql,[], // Bind values
        { autoCommit: true },
        function (err, result) {
            if (err) {
              throw error;
            } else {
              res.status(200).json({
                message: "success",
                data: result.rows
              });
            }
        });
};

async.waterfall(
  [
      doconnect,
      select_splans,
  ],
  function (err, conn) {
      if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
      if (conn)
          dorelease(conn);
  });

});


module.exports = router;