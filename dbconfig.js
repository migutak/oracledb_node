module.exports = {
    user          : process.env.DB_USER || "ecol",
  
    // Instead of hard coding the password, consider prompting for it,
    // passing it in an environment variable via process.env, or using
    // External Authentication. 
    password      : process.env.DB_PASSWORD || 'ecol',
  
    // For information on connection strings see:
    // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
    connectString : process.env.DB_CONNECTIONSTRING || "192.168.78.148:1521/ecol",
    // connectString : process.env.DB_CONNECTIONSTRING || "68.183.63.158:1521/ORCLCDB.localdomain",
    //connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "dbsvr2dr:1523/ecoltst",
  
    // Setting externalAuth is optional.  It defaults to false.  See:
    // https://oracle.github.io/node-oracledb/doc/api.html#extauth
    externalAuth  : process.env.DB_EXTERNALAUTH ? true : false
  };