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

router.get("/all", (req, res, next) => {
  let custnumber = req.query.custnumber;
    var sqlloans = "select telnumber, 'primary' source from customers_stage where custnumber = '"+custnumber+"' and telnumber is not null union " +
    "select celnumber, 'primary' from watch_stage where custnumber = '"+custnumber+"' and celnumber is not null union " +
    "select celnumber, 'primary' from customers_stage where custnumber = '"+custnumber+"' and celnumber is not null union " +
    "select telnumber, 'primary' from watch_stage where custnumber = '"+custnumber+"' and telnumber is not null union " +
    "select mobile, 'primary' from cards_stage where cardacct = '"+custnumber+"' and mobile is not null union " +
    "select mobile, 'primary' from cards_watch_stage where cardacct = '"+custnumber+"' and mobile is not null union " +
    "select tel, 'primary' from cards_stage where cardacct = '"+custnumber+"' and tel is not null union " +
    "select tel, 'primary' from cards_watch_stage where cardacct = '"+custnumber+"' and tel is not null union " +
    "select person , 'secondary' from teles where custnumber = '"+custnumber+"' and active = 'Y' and person is not null union " +
    "select telephone , 'secondary' from teles where custnumber = '"+custnumber+"' and active in ('Y','Yes') and telephone is not null"

    var sql = sqlloans;
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
            data: data.rows
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

router.post("/update", (req, res, next) => {
  var sql = "update teles set telephone = '"+ req.body.telephone +"', email='"+ req.body.email +"', updatedby='"+ req.body.updatedby +"', updatedlast='"+ req.body.updatedlast +"', active='" + req.body.active + "' where id=" + req.body.id;

  oracledb.getConnection(
      {
          user: dbConfig.user,
          password: dbConfig.password,
          connectString: dbConfig.connectString
      },
      function (err, connection) {
          if (err) {
              console.error(err.message);
              return;
          }
          connection.execute(
              sql,
              [],  // bind value for :id
              {},
              function (err, result) {
                  if (err) {
                      console.error(err.message);
                      doRelease(connection);
                      return;
                  }
                  res.status(200).json({
                    message: "success",
                    details: "teles is updated!"
                });
                  doRelease(connection);
              });
      });
});


module.exports = router;