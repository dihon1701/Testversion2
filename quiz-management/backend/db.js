// import mysql from "mysql2";

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",      // user MySQL của bạn
//     password: "Dhon17@14duyhoang",      // password MySQL của bạn
//     database: "quiz_app",
// });

// db.connect((err) => {
//     if (err) {
//         console.error("❌ Database connection failed:", err);
//         return;
//     }
//     console.log("✅ Connected to MySQL database!");
// });

// export default db;


// db.js
// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "Dhon17@14duyhoang",
//   database: "quiz_app"
// });

// db.connect(err => {
//   if (err) {
//     console.error("❌ Lỗi kết nối MySQL:", err);
//     return;
//   }
//   console.log("✅ MySQL Connected!");
// });

// module.exports = db;


import mysql from "mysql2";

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Dhon17@14duyhoang",
    database: process.env.DB_NAME || "quiz_app",
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL database!");
});

export default db;