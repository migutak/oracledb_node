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

router.post("/demandstatus", (req, res, next) => {
    var sqlloans = "update demandsdue set status = '"+ req.body.status +"', sentby='"+ req.body.sentby +"', datesent=" + req.body.datesent + " where id=" + req.body.id;
    var sqlcc = "update demandsdue set status = '"+ req.body.status +"', sentby='"+ req.body.sentby +"', datesent=" + req.body.datesent + " where id=" + req.body.id;

    var sql = sqlloans;
    if(req.body.from == 'cc') {
      sql = sqlcc
    }
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          data = await connection.execute(sql);
          //
          res.status(200).json({
            message: "success",
            details: "demand record status is updated!"
        });
      
        } catch (err) {
          console.error(err);
        } finally {
          if (connection) {
            try {
              await connection.close();   // Always close connections
            } catch (err) {
              console.error(err.message);
            }
          }
        }
      })();
});

module.exports = router;