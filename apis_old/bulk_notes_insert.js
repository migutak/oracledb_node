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

router.post("/bulknotes", (req, res, next) => {
  const success = 0;
  const failed = 0;
  if (req.body.length < 1) {
    res.status(200).json({
      message: "success",
      details: "no rows"
    });
  } else {
    for (i = 0; i < req.body.length; i++) {
      const owner = req.body[i].owner;
      const accnumber = req.body[i].accnumber;
      const custnumber =req.body[i].custnumber;
      const notemade =req.body[i].notemade;
      const notesrc = req.body[i].notesrc;

      const sql = "insert into notehis (accnumber,custnumber,owner,notesrc, notemade) values('"+accnumber+"'"+custnumber+"'"+owner+"'"+notesrc+"'"+notemade+"')";

      (async function () {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });

          data = await connection.execute(sql);
          success = success + 1;

        } catch (err) {
          console.error(err);
          failed = failed + 1;
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
    }
    res.status(200).json({
      message: "success",
      success: success,
      failed: failed
    });
  }
});

module.exports = router;