var express = require("express");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
var dbconfig = require('../dbconfig.js');

const router = express.Router();

router.post('/upload', function (req, res) {
  var username = 'miguta';
  var sys = 'ss';
  let bulk = null;
  let bulknotes = [];
  let data = JSON.parse(Buffer.from(req.body.datarows, 'base64').toString('ascii'))
  console.log(data[0])
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