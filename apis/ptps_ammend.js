var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbConfig = require('../dbconfig.js');

const router = express.Router();

router.post("/ammendptp", (req, res, next) => {
  const id = req.body.id;
  const ptpamount = req.body.ptpamount;
  const ptpdate = req.body.ptpdate;
  const ammendby = req.body.ammendby;
  const ammendcomment = req.body.ammendcomment;

  const sql = "update ptps set ptpamount =" + ptpamount + ", ptpdate='" + ptpdate + "', ammendby='" + ammendby + "', ammended='y', ammendcomment='" + ammendcomment + "' where id = " + id;

  (async function () {
    try {
      connection = await oracledb.getConnection({
        user: dbConfig.user,
        password: dbConfig.password,
        connectString: dbConfig.connectString
      });

      data = await connection.execute(sql);
      res.status(200).json({
        message: 'success'
      });
    } catch (err) {
      console.error(err);
      res.status(200).json({
        message: err.message
      });
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