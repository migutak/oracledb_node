module.exports = {
    user          : process.env.DB_USER || "ecol",
    password      : process.env.DB_PASSWORD || 'ecol',
    connectString : process.env.DB_CONNECTIONSTRING || "68.183.63.158:1521/orclcdb.localdomain",
    externalAuth  : process.env.DB_EXTERNALAUTH ? true : false
  };