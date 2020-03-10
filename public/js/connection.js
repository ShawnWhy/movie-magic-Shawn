var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "kil9uzd3tgem3naa.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "ls3zrg9vb8kz8vup",
  
    // Your password
    password: "sbl96an9cph1brn5",
    database: "aqsxeewj5c9qm4hh"
  });

  module.exports = connection;