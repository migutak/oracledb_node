
var express = require("express");
var bodyparser = require("body-parser");
var cors = require("cors");
var brokenptps = require("./apis/brokenptps");
var loans = require("./apis/loans");
var cards = require("./apis/cards");
var watch = require("./apis/watch");
var withfunds = require("./apis/withfunds");
var creditbuildup = require("./apis/creditbuldup");
var nocreditbuildup = require("./apis/nocreditbuldup");
var demandsdue = require("./apis/demandsdue");
var demandsduecc = require("./apis/demandsduecc");
var demandstatus = require("./apis/demands_status_update");
var teles = require("./apis/teles");
var notes = require("./apis/bulk_notes_insert");
var tcards = require("./apis/tcards");
var cards_watch_stage = require("./apis/cards_watch_stage");
var otheraccs = require("./apis/otheraccs");
var mcoopcash_stage = require("./apis/mcoopcash_stage");
var s_plans = require("./apis/tbl_s_plans");
var ptpsammend = require("./apis/ptps_ammend");
var gridviewall = require("./apis/grid_viewall");
var gridmcoopcashviewall = require("./apis/grid_mcoopcashviewall");
var gridcardsviewall = require("./apis/grid_cardsviewall");
var activeptps = require("./apis/activeptps");

const app = express();

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use("/nodeapi/loans",loans);
app.use("/nodeapi/watch",watch);
app.use("/nodeapi/cards",cards);
app.use("/nodeapi/withfunds",withfunds);
app.use("/nodeapi/brokenptps",brokenptps);
app.use("/nodeapi/creditbuildup",creditbuildup);
app.use("/nodeapi/nocreditbuildup",nocreditbuildup);
app.use("/nodeapi/demandsdue",demandsdue);
app.use("/nodeapi/demandsduecc",demandsduecc);
app.use("/nodeapi/demandstatus",demandstatus);
app.use("/nodeapi/notes",notes);
app.use("/nodeapi/teles",teles);
app.use("/nodeapi/tcards",tcards);
app.use("/nodeapi/cards_watch_stage",cards_watch_stage);
app.use("/nodeapi/otheraccs",otheraccs);
app.use("/nodeapi/mcoopcash_stage",mcoopcash_stage);
app.use("/nodeapi/s_plans",s_plans);
app.use("/nodeapi/ptpsammend",ptpsammend);
app.use("/nodeapi/gridviewall",gridviewall);
app.use("/nodeapi/gridmcoopcashviewall",gridmcoopcashviewall);
app.use("/nodeapi/gridcardsviewall",gridcardsviewall);
app.use("/nodeapi/activeptps",activeptps);

//if we are here then the specified request is not found
app.use((req,res,next)=> {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

//all other requests are not implemented.
app.use((err,req, res, next) => {
   res.status(err.status || 501);
   res.json({
       error: {
           code: err.status || 501,
           message: err.message
       }
   });
});

module.exports = app;
