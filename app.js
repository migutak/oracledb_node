
var express = require("express");
var bodyparser = require("body-parser");
var cors = require("cors");
var brokenptps = require("./apis/brokenptps");
var loans = require("./apis/loans");
var cards = require("./apis/cards");
var watch = require("./apis/watch");
var withfunds = require("./apis/withfunds");

const app = express();

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use("/nodeapi/loans",loans);
app.use("/nodeapi/watch",watch);
app.use("/nodeapi/cards",cards);
app.use("/nodeapi/withfunds",withfunds);
app.use("/nodeapi/brokenptps",brokenptps);

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
