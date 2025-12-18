// // import mysql from "mysql2";

// // const db = mysql.createConnection({
// //     host: "localhost",
// //     user: "root",      // user MySQL của bạn
// //     password: "Dhon17@14duyhoang",      // password MySQL của bạn
// //     database: "quiz_app",
// // });

// // db.connect((err) => {
// //     if (err) {
// //         console.error("❌ Database connection failed:", err);
// //         return;
// //     }
// //     console.log("✅ Connected to MySQL database!");
// // });

// // export default db;


// // db.js
// // const mysql = require("mysql2");

// // const db = mysql.createConnection({
// //   host: "localhost",
// //   user: "root",
// //   password: "Dhon17@14duyhoang",
// //   database: "quiz_app"
// // });

// // db.connect(err => {
// //   if (err) {
// //     console.error("❌ Lỗi kết nối MySQL:", err);
// //     return;
// //   }
// //   console.log("✅ MySQL Connected!");
// // });

// // module.exports = db;


// import mysql from "mysql2";

// const db = mysql.createConnection({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "Dhon17@14duyhoang",
//     database: process.env.DB_NAME || "quiz_app",
//     port: process.env.DB_PORT || 3306,
// });

// db.connect((err) => {
//     if (err) {
//         console.error("❌ Database connection failed:", err);
//         return;
//     }
//     console.log("✅ Connected to MySQL database!");
// });

// export default db;

import mysql from "mysql2";

// ========================
// 🔴 VẤN ĐỀ CŨ: Dùng createConnection (1 connection duy nhất)
// ✅ FIX: Dùng createPool (nhiều connections, auto reconnect)
// ========================

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Dhon17@14duyhoang",
    database: process.env.DB_NAME || "quiz_app",
    port: process.env.DB_PORT || 3306,
    
    // ========================
    // Connection Pool Settings
    // ========================
    connectionLimit: 10,              // Max 10 connections
    waitForConnections: true,         // Đợi nếu hết connection
    queueLimit: 0,                    // Unlimited queue
    
    // ========================
    // Timeout Settings (Quan trọng cho Render)
    // ========================
    connectTimeout: 10000,            // 10s timeout khi connect
    acquireTimeout: 10000,            // 10s timeout khi lấy connection từ pool
    timeout: 60000,                   // 60s query timeout
    
    // ========================
    // Keep-Alive Settings
    // ========================
    enableKeepAlive: true,            // Giữ connection alive
    keepAliveInitialDelay: 0,         // Bắt đầu keep-alive ngay
    
    // ========================
    // Character Set
    // ========================
    // ✅ THÊM DÒNG NÀY
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    
    // ========================
    // Timezone
    // ========================
    timezone: "+07:00",               // UTC+7 (Vietnam)
    
    // ========================
    // Multiple Statements (Cho stored procedures)
    // ========================
    multipleStatements: true,
    
    // ========================
    // Debugging (chỉ trong development)
    // ========================
    debug: process.env.NODE_ENV !== "production" ? false : false
});

// ========================
// Test Connection ngay khi khởi động
// ========================
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        console.error("Config:", {
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            database: process.env.DB_NAME || "quiz_app",
            port: process.env.DB_PORT || 3306
        });
        
        // Retry connection sau 5s
        console.log("🔄 Retrying connection in 5 seconds...");
        setTimeout(() => {
            pool.getConnection((retryErr, retryConn) => {
                if (retryErr) {
                    console.error("❌ Retry failed:", retryErr.message);
                    process.exit(1); // Exit nếu không connect được
                } else {
                    console.log("✅ Connected to MySQL database on retry!");
                    retryConn.release();
                }
            });
        }, 5000);
        
        return;
    }
    
    console.log("✅ Connected to MySQL database!");
    console.log(`📊 Database: ${process.env.DB_NAME || "quiz_app"}`);
    console.log(`🌐 Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}`);
    
    // Test query để verify
    connection.query("SELECT 1 + 1 AS result", (testErr, results) => {
        if (testErr) {
            console.error("❌ Test query failed:", testErr);
        } else {
            console.log("✅ Test query successful:", results[0].result);
        }
    });
    
    connection.release();
});

// ========================
// Handle Pool Errors
// ========================
pool.on("error", (err) => {
    console.error("❌ Pool error:", err);
    
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.log("🔄 Connection lost, pool will reconnect automatically");
    } else if (err.code === "ER_CON_COUNT_ERROR") {
        console.error("❌ Too many connections!");
    } else if (err.code === "ECONNREFUSED") {
        console.error("❌ Connection refused! Check if MySQL is running");
    } else {
        throw err;
    }
});

// ========================
// Graceful Shutdown
// ========================
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, closing database connections...");
    pool.end((err) => {
        if (err) {
            console.error("❌ Error closing pool:", err);
            process.exit(1);
        }
        console.log("✅ Database pool closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, closing database connections...");
    pool.end((err) => {
        if (err) {
            console.error("❌ Error closing pool:", err);
            process.exit(1);
        }
        console.log("✅ Database pool closed");
        process.exit(0);
    });
});

// ========================
// Helper: Execute query với promise
// ========================
export const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// ========================
// Helper: Execute transaction
// ========================
export const executeTransaction = async (queries) => {
    const connection = await pool.promise().getConnection();
    
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { sql, params } of queries) {
            const [result] = await connection.query(sql, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
        
    } catch (err) {
        await connection.rollback();
        throw err;
        
    } finally {
        connection.release();
    }
};

// ========================
// Helper: Check database health
// ========================
export const checkDatabaseHealth = async () => {
    try {
        const [rows] = await pool.promise().query("SELECT 1 as health");
        return { healthy: true, message: "Database connected" };
    } catch (err) {
        return { healthy: false, message: err.message };
    }
};

// ========================
// Export pool (backward compatible)
// ========================
export default pool;