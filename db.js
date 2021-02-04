const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST_PROD,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD_PROD,
  database: process.env.DB_NAME,
  connectionLimit: 20
});

const query = async (func) => {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const result = await func(connection);
      connection.release();
      return result;
    } catch (err) {
      console.log("Query Error: ", err);
      connection.release();
      return false;
    }
  } catch (err) {
    console.log("DB Error: ", err);
    return false;
  }
};

module.exports = query;
