module.exports = {
    user          : process.env.DB_USER || "ecol",
    password      : process.env.DB_PASSWORD || 'ecol',
    connectString : process.env.DB_CONNECTIONSTRING || "127.0.0.1:1521/ORCLCDB.localdomain",
    // connectString : process.env.DB_CONNECTIONSTRING || "68.183.63.158:1521/ORCLCDB.localdomain",
    //connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "dbsvr2dr:1523/ecoltst",
    externalAuth  : process.env.DB_EXTERNALAUTH ? true : false
  };