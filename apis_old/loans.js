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

//
router.get("/viewall", (req, res, next) => {
    const pagesize = req.query.pagesize;
	const pagenum = req.query.pagenum;
	var sortdatafield = req.query.sortdatafield;
	var sortorder = req.query.sortorder;
	var filterscount = req.query.filterscount;
					
	// console.log('filterscount=' + filterscount);				
	var where = "";
    const start = pagesize * pagenum;
    if (filterscount > 0) {
        where = " WHERE (";
        let tmpdatafield = "";
        let tmpfilteroperator = "";
        
        for (let i=0; i < filterscount; i++){
            const filtervalue = req.query.filtervalue0;
            const filtercondition = req.query.filtercondition0;
            const filterdatafield = req.query.filterdatafield0;
            const filteroperator = req.query.filteroperator0;
            
            // console.log(filtercondition);

            if (tmpdatafield == "")
            {
                tmpdatafield = filterdatafield;			
            }
            else if (tmpdatafield !=filterdatafield)
            {
                where += ")AND(";
            }
            else if (tmpdatafield == filterdatafield)
            {
                if (tmpfilteroperator == "0")
                {
                    where += " AND ";
                }
                else where += " OR ";	
            }
                
            // build the "WHERE" clause depending on the filter's condition, value and datafield.
            switch(filtercondition){
            case "CONTAINS":
                where += " " + filterdatafield + " LIKE '%" + filtervalue + "%'";
                break;
            case "CONTAINS_CASE_SENSITIVE":
                where += " " + filterdatafield + " LIKE BINARY '%" + filtervalue + "%'";
                break;
            case "DOES_NOT_CONTAIN":
                where += " " + filterdatafield + " NOT LIKE '%" + filtervalue + "%'";
                break;
            case "DOES_NOT_CONTAIN_CASE_SENSITIVE":
                where += " " + filterdatafield + " NOT LIKE BINARY '%" + filtervalue + "%'";
                break;
            case "EQUAL":
                where += " " + filterdatafield + " = '" + filtervalue + "'";
                break;
            case "EQUAL_CASE_SENSITIVE":
                where += " " + filterdatafield + " LIKE BINARY '" + filtervalue + "'";
                break;
            case "NOT_EQUAL":
                where += " " + filterdatafield + " NOT LIKE '" + filtervalue + "'";
                break;
            case "NOT_EQUAL_CASE_SENSITIVE":
                where += " " + filterdatafield + " NOT LIKE BINARY '" + filtervalue + "'";
                break;
            case "GREATER_THAN":
                where += " " + filterdatafield + " > '" + filtervalue + "'";
                break;
            case "LESS_THAN":
                where += " " + filterdatafield + " < '" + filtervalue + "'";
                break;
            case "GREATER_THAN_OR_EQUAL":
                where += " " + filterdatafield + " >= '" + filtervalue + "'";
                break;
            case "LESS_THAN_OR_EQUAL":
                where += " " + filterdatafield + " <= '" + filtervalue + "'";
                break;
            case "STARTS_WITH":
                where += " " + filterdatafield + " LIKE '" + filtervalue + "%'";
                break;
            case "STARTS_WITH_CASE_SENSITIVE":
                where += " " + filterdatafield + " LIKE BINARY '" + filtervalue + "%'";
                break;
            case "ENDS_WITH":
                where += " " + filterdatafield + " LIKE '%" + filtervalue + "'";
                break;
            case "ENDS_WITH_CASE_SENSITIVE":
                where += " " + filterdatafield + " LIKE BINARY '%" + filtervalue + "'";
                break;
            case "NULL":
                where += " " + filterdatafield + " IS NULL";
                break;
            case "NOT_NULL":
                where += " " + filterdatafield + " IS NOT NULL";
                break;
            }
            if (i == filterscount - 1)
            {
                where += ")";
            }

                
            tmpfilteroperator = filteroperator;
            tmpdatafield = filterdatafield;
        }
    }
    
    const orderby = "";
    if (sortdatafield != null && sortorder != null && (sortorder.equals("asc") || sortorder.equals("desc")))
    {
        orderby = "order by " + sortdatafield + " " + sortorder;
    }

    var sql = "Select * from tqall " + where + " " + orderby + " offset " + start + " rows fetch next " + pagesize + " rows only";
    // console.log('sql ' + sql);
    var total = 0;
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          result = await connection.execute("select count(*) total from tqall " + where + "");
          data = await connection.execute(sql);
          //
          total = result.rows[0].TOTAL;
          res.status(200).json({
            message: "success",
            totalRecords: total,
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

    /*oracledb.getConnection(
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
                    // console.log(result.metaData);
                    // console.log(result.rows);
                    res.status(200).json({
                        message: "success",
                        totalRecords: total,
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });*/

}); // end viewall

router.get("/memos", (req, res, next) => {
    var sql = "select distinct cycle memo from cards_stage union select distinct substr(accnumber,3,3) memo from loans_stage"
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
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });
});


router.get("/demandlettersccdue", (req, res, next) => {
    var sql = "Select count(*) totalviewall from demandsduecc";
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err);
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
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });
});

router.get("/demandlettersdue", (req, res, next) => {
    var sql = "Select count(*) totalviewall from demandsdue";
    oracledb.getConnection(
        {
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err);
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
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });
});


  router.get("/brokenptps", (req, res, next) => {
    var sql = "select count(*) total from ptps p join tqall t on p.accnumber=t.accnumber where p.met !='met'";
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
                // [],  // bind value for :id
                // {},
                function (err, result) {
                    if (err) {
                        console.error(err.message);
                        doRelease(connection);
                        return;
                    }
                    res.status(200).json({
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });
});

router.get("/buckets", (req, res, next) => {
    var sql = "select bucket label, sum(abs(oustbalance)) Value from tqall group by bucket order by bucket";
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
                        data: result.rows
                    });
                    doRelease(connection);
                });
        });
});

router.get("/autodemands", (req, res, next) => {
    (async function() {
        try {
          connection = await oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
          });
      
          result = await connection.execute("select * from autoletters where active = 'true'");
          overalResult = [];
          for (i=0; i<result.rows.length; i++) {
              const memogrp = result.rows[i].MEMOGROUP;
              const daysinarr = result.rows[i].DAYSINARR;
              const letterid = result.rows[i].LETTERID;
              
              const sqlInsert = "select accnumber,custnumber,daysinarr, '"+letterid+"' demand from tqall where substr(accnumber,3,3) = '" + memogrp + "' and daysinarr = " + daysinarr;
              selectResult = await connection.execute(sqlInsert);
              if(selectResult.rows.length > 0) {console.log(selectResult.rows)};
              overalResult = selectResult.rows;
          };
          // data = await connection.execute(sql);
          //
          res.status(200).json({
            message: "success",
            data: overalResult
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


router.post("/addDemand", (req, res, next) => {
    console.log(req.body);
    var sql = "insert into test(accnumber,custnumber,daysinarr,demand values())"
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
                        message: "insert success"
                    });
                    doRelease(connection);
                });
        });
    
});

//handles url http://localhost:6001/products/1001
router.get("/:productId", (req, res, next) => {
    let pid = req.params.productId;

    db.query(Product.getProductByIdSQL(pid), (err, data) => {
        if (!err) {
            if (data && data.length > 0) {

                res.status(200).json({
                    message: "Product found.",
                    product: data
                });
            } else {
                res.status(200).json({
                    message: "Product Not found."
                });
            }
        }
    });
});
  

module.exports = router;