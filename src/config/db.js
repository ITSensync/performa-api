const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',   // WAJIB localhost
  port: 1404,          // PORT LOKAL SSH TUNNEL
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
