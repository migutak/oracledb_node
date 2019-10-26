module.exports = {
    user          : process.env.DB_USER || "ecol",
    password      : process.env.DB_PASSWORD || 'ecol',
    connectString : process.env.DB_CONNECTIONSTRING || "127.0.0.1:1521/ORCLCDB.localdomain",
    externalAuth  : process.env.DB_EXTERNALAUTH ? true : false
  };