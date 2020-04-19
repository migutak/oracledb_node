module.exports = {
    user          : process.env.DB_USER || "ecol",
    password      : process.env.DB_PASSWORD || 'ecol',//'DsQSnttm_1',
    connectString : process.env.DB_CONNECTIONSTRING || "127.0.0.1:1521/orclcdb.localdomain",
    //connectString : process.env.DB_CONNECTIONSTRING || "172.16.20.2:1523/ECOLTST", 
    externalAuth  : process.env.DB_EXTERNALAUTH ? true : false
  };