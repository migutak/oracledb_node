var express = require("express");
var oracledb = require('oracledb');
var async = require('async');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbconfig = require('../dbconfig.js');
var SimpleOracleDB = require('simple-oracledb');
SimpleOracleDB.extend(oracledb);
const router = express.Router();

router.post('/uploadbulk-test', function (req, res) {
  var doconnect = function (cb) {
    oracledb.getConnection(
        {
          user: dbconfig.user,
          password: dbconfig.password,
          connectString: dbconfig.connectString
        },
        cb);
  };

  var dorelease = function (conn) {
    conn.close(function (err) {
      if (err)
        console.error(err.message);
    });
  };
  var doinsert_autocommit = function (conn, cb) {

    conn.executeMany(
        "insert into notehis_bulk(custnumber,accnumber,notemade,owner,notesrc) values(:custnumber,:accnumber,:notemade,:owner,:notesrc)",
        req.body,
        { autoCommit: true },  // Override the default non-autocommit behavior
        function (err, result) {
          //console.log(result.rowsAffected);
          if (err) {
            return cb(err, conn);
          } else {
            console.log("Rows inserted: " + result.rowsAffected);
            res.status(200).json({
              success: true,
              rowsAffected: result.rowsAffected
            })
            return cb(null, conn);

          }
        });
  };


  async.waterfall(
      [
        doconnect,
        doinsert_autocommit,

      ],
      function (err, conn) {
        if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
        if (conn)
          dorelease(conn);
      });
});

router.post('/uploadbulk', function (req, res) {
  const body = req.body
  const last = 0;
  console.log(body.length)
  for (i = 0; i < body.length; i++) {
    if (i = body.length - 1) {
      last == 1;
    }
    run(body, last);
  }

  const sql = "insert into notehis(custnumber,accnumber,notemade,owner,notesrc) values(:custnumber,:accnumber,:notemade,:owner,:notesrc)";
  async function run(inbody, last) {
    let connection;

    try {
      connection = await oracledb.getConnection({
        user: dbconfig.user,
        password: dbconfig.password,
        connectString: dbconfig.connectString
      });

      // const result = await connection.executeMany(sql, req.body[0], { autoCommit: true });
      const result = await connection.execute(sql, [inbody.custnumber, inbody.accnumber, inbody.notemade, inbody.owner, inbody.notesrc]);
      console.log("Result is:", result);
      if (last == 1) {
        //
        res.status(200).json({
          success: true,
          result: result
        })
      }

    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

});

router.post('/upload', function (req, res) {
  var username = 'miguta';
  var sys = 'ss';
  let bulk = null;
  let bulknotes = [];
  let data = JSON.parse(Buffer.from(req.body.datarows, 'base64').toString('ascii'))
  // console.log(data[0])
  for (x = 0; x < data.length; x++) {
    let bulknote = {};
    if (sys == 'cc' || sys == 'watchcc') {
      bulknote.custnumber = data[x].accnumber;
    } else {
      bulknote.custnumber = (data[x].accnumber).substring(5, 12);
    }
    bulknote.accnumber = data[x].accnumber;
    bulknote.notemade = data[x].notemade;
    bulknote.owner = username
    bulknote.notesrc = 'uploaded a note';
    bulknote.noteimp = 'N';
    bulknotes.push(bulknote);
  }

  const sql = "insert into notehis(custnumber,accnumber,notemade,owner,notesrc, noteimp) values(:custnumber,:accnumber,:notemade,:owner,:notesrc,:noteimp)";
  async function run() {
    let connection;

    try {
      connection = await oracledb.getConnection({
        user: dbconfig.user,
        password: dbconfig.password,
        connectString: dbconfig.connectString
      });

      const result = await connection.executeMany(sql, bulknotes, { autoCommit: true });
      console.log("Result is:", result);
      res.status(200).json({
        success: true,
        rows: req.totalrows,
        notes: bulknotes
      })

    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  run();

});

module.exports = router;
