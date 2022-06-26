const mysql = require('mysql2/promise');

// Connect to database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'lesson',
    database: 'erp',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

module.exports = pool;