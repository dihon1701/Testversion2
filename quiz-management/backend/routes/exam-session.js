// import express from "express";
// import db from "../db.js";

// const router = express.Router();

// // ========================
// // 🐛 DEBUG HELPER - Log query details
// // ========================
// const logQuery = (label, query, params = []) => {
//     console.log(`\n${'='.repeat(60)}`);
//     console.log(`📊 [${label}] Executing query:`);
//     console.log('Query:', query);
//     console.log('Params:', JSON.stringify(params));
//     console.log('='.repeat(60));
// };

// // ========================
// // 🚀 START SESSION - Sử dụng Stored Procedure
// // ========================
// router.post("/start", async (req, res) => {
//     try {
//         const {
//             userId,
//             examId,
//             deviceInfo = {},
//             settings = {}
//         } = req.body;

//         if (!userId || !examId) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Thiếu userId hoặc examId" 
//             });
//         }

//         // Tạo session ID unique với timestamp + random
//         const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//         // Chuẩn bị device info dạng JSON
//         const deviceJSON = JSON.stringify({
//             browser: deviceInfo.browser || 'unknown',
//             browserVersion: deviceInfo.browserVersion,
//             os: deviceInfo.os,
//             osVersion: deviceInfo.osVersion,
//             screenResolution: deviceInfo.screenResolution,
//             timezone: deviceInfo.timezone,
//             language: deviceInfo.language,
//             platform: deviceInfo.platform
//         });

//         console.log(`🚀 Starting session for User ${userId}, Exam ${examId}`);

//         // Gọi stored procedure với promise
//         const query = "CALL StartExamSession(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @kicked)";
//         const params = [
//             sessionId,
//             userId,
//             examId,
//             deviceJSON,
//             deviceInfo.userAgent || null,
//             deviceInfo.ipAddress || null,
//             deviceInfo.screenResolution || null,
//             deviceInfo.timezone || null,
//             deviceInfo.platform || null,
//             settings.requireFullscreen !== false, // Default true
//             settings.maxViolations || 3
//         ];
        
//         logQuery('START SESSION', query, params);
        
//         const [results] = await db.promise().query(query, params);

//         // Lấy giá trị @kicked
//         const [[{ '@kicked': wasKicked }]] = await db.promise().query('SELECT @kicked');

//         console.log(`✅ Session created: ${sessionId}, Kicked old: ${wasKicked}`);

//         res.json({
//             success: true,
//             sessionId,
//             message: wasKicked 
//                 ? "Phiên thi cũ đã bị đóng, bắt đầu phiên mới" 
//                 : "Bắt đầu phiên thi thành công",
//             kicked: wasKicked === 1,
//             settings: {
//                 requireFullscreen: settings.requireFullscreen !== false,
//                 maxViolations: settings.maxViolations || 3
//             }
//         });

//     } catch (err) {
//         console.error("❌ Start session error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         console.error("❌ SQL State:", err.sqlState);
//         console.error("❌ Error Code:", err.code);
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể tạo phiên thi: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 💓 HEARTBEAT - Kiểm tra session + Update timestamp
// // ========================
// router.post("/heartbeat", async (req, res) => {
//     try {
//         const { sessionId } = req.body;

//         if (!sessionId) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Thiếu sessionId" 
//             });
//         }

//         // Sử dụng function để check
//         const query1 = "SELECT IsSessionValid(?) as valid";
//         logQuery('HEARTBEAT - CHECK', query1, [sessionId]);
        
//         const [[{ valid }]] = await db.promise().query(query1, [sessionId]);

//         if (!valid) {
//             console.log(`⚠️ Session ${sessionId} is not valid (kicked or expired)`);
//             return res.json({
//                 success: true,
//                 valid: false,
//                 kicked: true,
//                 message: "Phiên thi đã bị đóng do có phiên khác hoặc hết hạn"
//             });
//         }

//         // Update heartbeat
//         const query2 = "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id COLLATE utf8mb4_unicode_ci = ?";
//         logQuery('HEARTBEAT - UPDATE', query2, [sessionId]);
        
//         await db.promise().query(query2, [sessionId]);

//         res.json({
//             success: true,
//             valid: true,
//             message: "Session đang hoạt động"
//         });

//     } catch (err) {
//         console.error("❌ Heartbeat error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         console.error("❌ SQL State:", err.sqlState);
//         console.error("❌ Error Code:", err.code);
//         res.status(500).json({ 
//             success: false, 
//             valid: false,
//             message: "Lỗi kiểm tra session: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 🚨 LOG VIOLATION - Ghi nhận vi phạm
// // ========================
// router.post("/violation", async (req, res) => {
//     try {
//         const {
//             sessionId,
//             userId,
//             examId,
//             violationType,
//             detail = ''
//         } = req.body;

//         if (!sessionId || !userId || !examId || !violationType) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Thiếu thông tin bắt buộc" 
//             });
//         }

//         // Validate violation type
//         const validTypes = [
//             'TAB_SWITCH', 'WINDOW_BLUR', 'EXIT_FULLSCREEN',
//             'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK',
//             'KEYBOARD_SHORTCUT', 'DEVTOOLS_OPEN', 'MULTIPLE_SESSION'
//         ];

//         if (!validTypes.includes(violationType)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Loại vi phạm không hợp lệ"
//             });
//         }

//         // Ghi log
//         const query1 = `INSERT INTO exam_violations (
//             session_id, user_id, exam_id, violation_type, detail
//         ) VALUES (?, ?, ?, ?, ?)`;
//         const params1 = [sessionId, userId, examId, violationType, detail];
        
//         logQuery('VIOLATION - INSERT', query1, params1);
        
//         await db.promise().query(query1, params1);

//         console.log(`⚠️ Violation: ${violationType} - User ${userId}`);

//         // Đếm số vi phạm với COLLATE explicit
//         const query2 = `SELECT 
//             COUNT(*) as count, 
//             s.max_violations
//          FROM exam_violations v
//          JOIN exam_sessions s ON v.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
//          WHERE v.session_id COLLATE utf8mb4_unicode_ci = ?
//          GROUP BY s.max_violations`;
         
//         logQuery('VIOLATION - COUNT', query2, [sessionId]);
        
//         const [[stats]] = await db.promise().query(query2, [sessionId]);

//         const violationCount = stats?.count || 0;
//         const maxViolations = stats?.max_violations || 3;

//         // Nếu vượt quá max, force end
//         if (violationCount >= maxViolations) {
//             console.log(`🚫 Max violations (${maxViolations}) reached, force end`);
            
//             const query3 = `UPDATE exam_sessions 
//                  SET is_active = FALSE, 
//                      end_time = NOW(), 
//                      is_forced_end = TRUE
//                  WHERE id COLLATE utf8mb4_unicode_ci = ?`;
                 
//             logQuery('VIOLATION - FORCE END', query3, [sessionId]);
            
//             await db.promise().query(query3, [sessionId]);

//             return res.json({
//                 success: true,
//                 forceEnd: true,
//                 violationCount,
//                 maxViolations,
//                 message: `Đã vi phạm ${violationCount}/${maxViolations} lần. Bài thi bị kết thúc.`
//             });
//         }

//         res.json({
//             success: true,
//             forceEnd: false,
//             violationCount,
//             maxViolations,
//             message: `Vi phạm ${violationCount}/${maxViolations}`
//         });

//     } catch (err) {
//         console.error("❌ Log violation error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         console.error("❌ SQL State:", err.sqlState);
//         console.error("❌ Error Code:", err.code);
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể ghi log vi phạm: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 📊 SUBMIT EXAM - Nộp bài thi
// // ========================
// router.post("/submit", async (req, res) => {
//     try {
//         const {
//             sessionId,
//             userId,
//             examId,
//             answers = {},
//             isForced = false
//         } = req.body;

//         if (!sessionId || !userId || !examId) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Thiếu thông tin bắt buộc" 
//             });
//         }

//         console.log(`📝 Submitting exam - Session: ${sessionId}`);

//         // ✅ KIỂM TRA XEM ĐÃ NỘP BÀI CHƯA
//         const checkQuery = "SELECT id FROM exam_results WHERE session_id COLLATE utf8mb4_unicode_ci = ?";
//         logQuery('SUBMIT - CHECK EXISTING', checkQuery, [sessionId]);
        
//         const [existing] = await db.promise().query(checkQuery, [sessionId]);
        
//         if (existing.length > 0) {
//             console.log(`⚠️ Session ${sessionId} already submitted`);
            
//             // Lấy kết quả đã có
//             const [existingResults] = await db.promise().query(
//                 "SELECT * FROM exam_results WHERE session_id COLLATE utf8mb4_unicode_ci = ?",
//                 [sessionId]
//             );
            
//             const result = existingResults[0];
            
//             // ✅ FIX: Parse JSON safely
//             let violationDetails = {};
//             try {
//                 if (typeof result.violation_details === 'string') {
//                     violationDetails = JSON.parse(result.violation_details || '{}');
//                 } else if (result.violation_details && typeof result.violation_details === 'object') {
//                     violationDetails = result.violation_details;
//                 }
//             } catch (e) {
//                 console.error('⚠️ Error parsing violation_details:', e);
//                 violationDetails = {};
//             }
            
//             return res.json({
//                 success: true,
//                 message: "Bài thi đã được nộp trước đó",
//                 alreadySubmitted: true,
//                 result: {
//                     score: result.score,
//                     totalPoints: result.total_points,
//                     percentage: result.total_points > 0 ? ((result.score / result.total_points) * 100).toFixed(2) : 0,
//                     correct: result.correct_answers,
//                     wrong: result.wrong_answers,
//                     unanswered: result.unanswered,
//                     totalQuestions: result.total_questions,
//                     violations: violationDetails,
//                     totalViolations: result.total_violations,
//                     passed: result.total_points > 0 && (result.score / result.total_points) >= 0.5
//                 }
//             });
//         }

//         // ✅ KIỂM TRA XEM SESSION CÒN ACTIVE KHÔNG
//         const [[sessionCheck]] = await db.promise().query(
//             "SELECT is_active, is_forced_end FROM exam_sessions WHERE id COLLATE utf8mb4_unicode_ci = ?",
//             [sessionId]
//         );
        
//         if (!sessionCheck) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Session không tồn tại"
//             });
//         }

//         // Lấy câu hỏi và đáp án đúng
//         const query1 = `SELECT 
//             q.id as question_id, 
//             q.points, 
//             a.id as answer_id, 
//             a.is_correct
//          FROM questions q
//          LEFT JOIN answers a ON q.id = a.question_id
//          WHERE q.exam_id = ?
//          ORDER BY q.id, a.id`;
         
//         logQuery('SUBMIT - GET EXAM DATA', query1, [examId]);
        
//         const [examData] = await db.promise().query(query1, [examId]);

//         // Build question map
//         const questionMap = {};
//         examData.forEach(row => {
//             if (!questionMap[row.question_id]) {
//                 questionMap[row.question_id] = {
//                     points: row.points,
//                     correctAnswer: null,
//                     allAnswers: []
//                 };
//             }
//             questionMap[row.question_id].allAnswers.push(row.answer_id);
//             if (row.is_correct) {
//                 questionMap[row.question_id].correctAnswer = row.answer_id;
//             }
//         });

//         // Tính điểm
//         let score = 0;
//         let totalPoints = 0;
//         let correct = 0;
//         let wrong = 0;
//         let unanswered = 0;

//         Object.keys(questionMap).forEach(qid => {
//             const q = questionMap[qid];
//             totalPoints += q.points;

//             const userAnswer = parseInt(answers[qid]);
            
//             if (!userAnswer || !q.allAnswers.includes(userAnswer)) {
//                 unanswered++;
//             } else if (userAnswer === q.correctAnswer) {
//                 score += q.points;
//                 correct++;
//             } else {
//                 wrong++;
//             }
//         });

//         // Lấy thống kê vi phạm
//         const query2 = `SELECT violation_type, COUNT(*) as count
//              FROM exam_violations
//              WHERE session_id COLLATE utf8mb4_unicode_ci = ?
//              GROUP BY violation_type`;
             
//         logQuery('SUBMIT - GET VIOLATIONS', query2, [sessionId]);
        
//         const [violations] = await db.promise().query(query2, [sessionId]);

//         const violationDetails = {};
//         let totalViolations = 0;
        
//         violations.forEach(v => {
//             violationDetails[v.violation_type] = v.count;
//             totalViolations += v.count;
//         });

//         // Lấy thời gian bắt đầu
//         const query3 = "SELECT start_time FROM exam_sessions WHERE id COLLATE utf8mb4_unicode_ci = ?";
        
//         logQuery('SUBMIT - GET START TIME', query3, [sessionId]);
        
//         const [[sessionInfo]] = await db.promise().query(query3, [sessionId]);

//         // ✅ INSERT với ON DUPLICATE KEY UPDATE (để tránh lỗi duplicate)
//         const query4 = `INSERT INTO exam_results (
//             session_id, user_id, exam_id,
//             score, total_points,
//             total_questions, correct_answers, wrong_answers, unanswered,
//             user_answers, total_violations, violation_details,
//             start_time, time_taken, is_forced_submit
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
//                   TIMESTAMPDIFF(SECOND, ?, NOW()), ?)
//         ON DUPLICATE KEY UPDATE
//             score = VALUES(score),
//             total_points = VALUES(total_points),
//             correct_answers = VALUES(correct_answers),
//             wrong_answers = VALUES(wrong_answers),
//             unanswered = VALUES(unanswered),
//             user_answers = VALUES(user_answers),
//             total_violations = VALUES(total_violations),
//             violation_details = VALUES(violation_details),
//             time_taken = VALUES(time_taken),
//             is_forced_submit = VALUES(is_forced_submit)`;
            
//         const params4 = [
//             sessionId, userId, examId,
//             score, totalPoints,
//             Object.keys(questionMap).length, correct, wrong, unanswered,
//             JSON.stringify(answers),
//             totalViolations,
//             JSON.stringify(violationDetails),
//             sessionInfo.start_time,
//             sessionInfo.start_time,
//             isForced
//         ];
        
//         logQuery('SUBMIT - INSERT RESULT', query4, params4);
        
//         await db.promise().query(query4, params4);

//         // Đóng session
//         const query5 = `UPDATE exam_sessions 
//              SET is_active = FALSE, end_time = NOW()
//              WHERE id COLLATE utf8mb4_unicode_ci = ?`;
             
//         logQuery('SUBMIT - CLOSE SESSION', query5, [sessionId]);
        
//         await db.promise().query(query5, [sessionId]);

//         console.log(`✅ Exam submitted - Score: ${score}/${totalPoints}`);

//         res.json({
//             success: true,
//             message: "Nộp bài thành công",
//             result: {
//                 score,
//                 totalPoints,
//                 percentage: totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(2) : 0,
//                 correct,
//                 wrong,
//                 unanswered,
//                 totalQuestions: Object.keys(questionMap).length,
//                 violations: violationDetails,
//                 totalViolations,
//                 passed: totalPoints > 0 && (score / totalPoints) >= 0.5
//             }
//         });

//     } catch (err) {
//         console.error("❌ Submit exam error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         console.error("❌ SQL State:", err.sqlState);
//         console.error("❌ Error Code:", err.code);
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể nộp bài: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 📈 GET RESULT - Lấy kết quả chi tiết
// // ========================
// router.get("/result/:sessionId", async (req, res) => {
//     try {
//         const { sessionId } = req.params;

//         // JOIN với COLLATE explicit
//         const query = `SELECT 
//             r.*,
//             u.username,
//             u.full_name,
//             e.title as exam_title,
//             e.duration as exam_duration,
//             s.start_time,
//             s.end_time,
//             s.device_fingerprint,
//             s.ip_address
//          FROM exam_results r
//          JOIN users u ON r.user_id = u.id
//          JOIN exams e ON r.exam_id = e.id
//          JOIN exam_sessions s ON r.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
//          WHERE r.session_id COLLATE utf8mb4_unicode_ci = ?`;
         
//         logQuery('GET RESULT', query, [sessionId]);
        
//         const [results] = await db.promise().query(query, [sessionId]);

//         if (results.length === 0) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Không tìm thấy kết quả" 
//             });
//         }

//         const result = results[0];

//         // Parse JSON fields safely
//         try {
//             result.user_answers = typeof result.user_answers === 'string' 
//                 ? JSON.parse(result.user_answers) 
//                 : result.user_answers;
            
//             result.violation_details = typeof result.violation_details === 'string' 
//                 ? JSON.parse(result.violation_details) 
//                 : result.violation_details;
            
//             if (result.device_fingerprint) {
//                 result.device_info = typeof result.device_fingerprint === 'string'
//                     ? JSON.parse(result.device_fingerprint)
//                     : result.device_fingerprint;
//             }
//         } catch (e) {
//             console.error('⚠️ Error parsing JSON fields:', e);
//         }

//         res.json({
//             success: true,
//             data: result
//         });

//     } catch (err) {
//         console.error("❌ Get result error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         console.error("❌ SQL State:", err.sqlState);
//         console.error("❌ Error Code:", err.code);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy kết quả: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 📊 GET USER RESULTS - Lịch sử thi của user
// // ========================
// router.get("/results/user/:userId", async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const { limit = 20, offset = 0 } = req.query;

//         const query = `SELECT 
//             r.id,
//             r.session_id,
//             r.score,
//             r.total_points,
//             r.submit_time,
//             r.time_taken,
//             r.total_violations,
//             r.is_forced_submit,
//             e.title as exam_title,
//             e.duration
//          FROM exam_results r
//          JOIN exams e ON r.exam_id = e.id
//          WHERE r.user_id = ?
//          ORDER BY r.submit_time DESC
//          LIMIT ? OFFSET ?`;
         
//         logQuery('GET USER RESULTS', query, [userId, parseInt(limit), parseInt(offset)]);
        
//         const [results] = await db.promise().query(query, [userId, parseInt(limit), parseInt(offset)]);

//         // Đếm tổng số
//         const [[{ total }]] = await db.promise().query(
//             "SELECT COUNT(*) as total FROM exam_results WHERE user_id = ?",
//             [userId]
//         );

//         res.json({
//             success: true,
//             total,
//             limit: parseInt(limit),
//             offset: parseInt(offset),
//             data: results
//         });

//     } catch (err) {
//         console.error("❌ Get user results error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy lịch sử thi: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 👁️ GET ACTIVE SESSIONS (Admin/Teacher)
// // ========================
// router.get("/active", async (req, res) => {
//     try {
//         const query = "SELECT * FROM active_sessions ORDER BY start_time DESC";
        
//         logQuery('GET ACTIVE SESSIONS', query);
        
//         const [sessions] = await db.promise().query(query);

//         res.json({
//             success: true,
//             total: sessions.length,
//             data: sessions
//         });

//     } catch (err) {
//         console.error("❌ Get active sessions error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy danh sách phiên thi: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// // ========================
// // 🧹 CLEANUP STALE SESSIONS (Cron job endpoint)
// // ========================
// router.post("/cleanup", async (req, res) => {
//     try {
//         const query = "CALL CleanupStaleSessions()";
        
//         logQuery('CLEANUP', query);
        
//         await db.promise().query(query);
        
//         res.json({
//             success: true,
//             message: "Đã dọn dẹp các phiên thi cũ"
//         });

//     } catch (err) {
//         console.error("❌ Cleanup error:", err);
//         console.error("❌ SQL Message:", err.sqlMessage);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi dọn dẹp: " + err.message,
//             sqlError: err.sqlMessage
//         });
//     }
// });

// export default router;

import express from "express";
import db from "../db.js";

const router = express.Router();

// ========================
// 🐛 DEBUG HELPER - Log query details
// ========================
const logQuery = (label, query, params = []) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 [${label}] Executing query:`);
    console.log('Query:', query);
    console.log('Params:', JSON.stringify(params));
    console.log('='.repeat(60));
};

// ========================
// 🚀 START SESSION - Sử dụng Stored Procedure
// ========================
router.post("/start", async (req, res) => {
    try {
        const {
            userId,
            examId,
            deviceInfo = {},
            settings = {}
        } = req.body;

        if (!userId || !examId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu userId hoặc examId" 
            });
        }

        // Tạo session ID unique với timestamp + random
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Chuẩn bị device info dạng JSON
        const deviceJSON = JSON.stringify({
            browser: deviceInfo.browser || 'unknown',
            browserVersion: deviceInfo.browserVersion,
            os: deviceInfo.os,
            osVersion: deviceInfo.osVersion,
            screenResolution: deviceInfo.screenResolution,
            timezone: deviceInfo.timezone,
            language: deviceInfo.language,
            platform: deviceInfo.platform
        });

        console.log(`🚀 Starting session for User ${userId}, Exam ${examId}`);

        // Gọi stored procedure với promise
        const query = "CALL StartExamSession(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @kicked)";
        const params = [
            sessionId,
            userId,
            examId,
            deviceJSON,
            deviceInfo.userAgent || null,
            deviceInfo.ipAddress || null,
            deviceInfo.screenResolution || null,
            deviceInfo.timezone || null,
            deviceInfo.platform || null,
            settings.requireFullscreen !== false, // Default true
            settings.maxViolations || 3
        ];
        
        logQuery('START SESSION', query, params);
        
        const [results] = await db.promise().query(query, params);

        // Lấy giá trị @kicked
        const [[{ '@kicked': wasKicked }]] = await db.promise().query('SELECT @kicked');

        console.log(`✅ Session created: ${sessionId}, Kicked old: ${wasKicked}`);

        res.json({
            success: true,
            sessionId,
            message: wasKicked 
                ? "Phiên thi cũ đã bị đóng, bắt đầu phiên mới" 
                : "Bắt đầu phiên thi thành công",
            kicked: wasKicked === 1,
            settings: {
                requireFullscreen: settings.requireFullscreen !== false,
                maxViolations: settings.maxViolations || 3
            }
        });

    } catch (err) {
        console.error("❌ Start session error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        console.error("❌ SQL State:", err.sqlState);
        console.error("❌ Error Code:", err.code);
        res.status(500).json({ 
            success: false, 
            message: "Không thể tạo phiên thi: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 💓 HEARTBEAT - Kiểm tra session + Update timestamp (FIXED)
// ========================
router.post("/heartbeat", async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu sessionId" 
            });
        }

        console.log(`💓 Heartbeat check for session: ${sessionId}`);

        // ✅ FIX 1: Kiểm tra session (KHÔNG dùng is_kicked)
        const query1 = `SELECT 
            id, 
            is_active,
            user_id,
            exam_id,
            start_time,
            TIMESTAMPDIFF(SECOND, last_heartbeat, NOW()) as seconds_since_heartbeat,
            TIMESTAMPDIFF(SECOND, start_time, NOW()) as session_age
        FROM exam_sessions 
        WHERE id = ?`;
        
        logQuery('HEARTBEAT - CHECK', query1, [sessionId]);
        
        const [sessions] = await db.promise().query(query1, [sessionId]);

        // ✅ FIX 2: Kiểm tra session tồn tại
        if (sessions.length === 0) {
            console.log(`⚠️ Session ${sessionId} not found`);
            return res.json({
                success: true,
                valid: false,
                kicked: false,
                message: "Phiên thi không tồn tại"
            });
        }

        const session = sessions[0];

        // ✅ FIX 3: Kiểm tra is_active
        if (!session.is_active) {
            console.log(`⚠️ Session ${sessionId} is not active (might be kicked)`);
            return res.json({
                success: true,
                valid: false,
                kicked: true,
                message: "Phiên thi đã kết thúc"
            });
        }

        // ✅ FIX 4: Kiểm tra có session mới hơn không (kicked logic)
        const checkKickedQuery = `SELECT COUNT(*) as newer_count 
            FROM exam_sessions 
            WHERE user_id = ? 
            AND exam_id = ? 
            AND start_time > ?
            AND is_active = TRUE`;
            
        const [[{ newer_count }]] = await db.promise().query(checkKickedQuery, [
            session.user_id,
            session.exam_id,
            session.start_time
        ]);

        if (newer_count > 0) {
            console.log(`⚠️ Session ${sessionId} kicked by newer session`);
            
            // Đánh dấu session cũ không active
            await db.promise().query(
                "UPDATE exam_sessions SET is_active = FALSE WHERE id = ?",
                [sessionId]
            );
            
            return res.json({
                success: true,
                valid: false,
                kicked: true,
                message: "Phiên thi đã bị đóng do có phiên mới"
            });
        }

        // ✅ FIX 5: Kiểm tra timeout (5 phút không có heartbeat)
        if (session.seconds_since_heartbeat > 300) {
            console.log(`⚠️ Session ${sessionId} timed out (${session.seconds_since_heartbeat}s)`);
            
            // Đánh dấu session hết hạn
            await db.promise().query(
                "UPDATE exam_sessions SET is_active = FALSE WHERE id = ?",
                [sessionId]
            );
            
            return res.json({
                success: true,
                valid: false,
                kicked: false,
                message: "Phiên thi đã hết hạn"
            });
        }

        // ✅ FIX 5: Update heartbeat
        const query2 = "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id = ?";
        logQuery('HEARTBEAT - UPDATE', query2, [sessionId]);
        
        await db.promise().query(query2, [sessionId]);

        console.log(`✅ Heartbeat updated for session ${sessionId}`);

        res.json({
            success: true,
            valid: true,
            message: "Session đang hoạt động"
        });

    } catch (err) {
        console.error("❌ Heartbeat error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        console.error("❌ SQL State:", err.sqlState);
        console.error("❌ Error Code:", err.code);
        res.status(500).json({ 
            success: false, 
            valid: false,
            message: "Lỗi kiểm tra session: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 🚨 LOG VIOLATION - Ghi nhận vi phạm
// ========================
router.post("/violation", async (req, res) => {
    try {
        const {
            sessionId,
            userId,
            examId,
            violationType,
            detail = ''
        } = req.body;

        if (!sessionId || !userId || !examId || !violationType) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin bắt buộc" 
            });
        }

        // Validate violation type
        const validTypes = [
            'TAB_SWITCH', 'WINDOW_BLUR', 'EXIT_FULLSCREEN',
            'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK',
            'KEYBOARD_SHORTCUT', 'DEVTOOLS_OPEN', 'MULTIPLE_SESSION'
        ];

        if (!validTypes.includes(violationType)) {
            return res.status(400).json({
                success: false,
                message: "Loại vi phạm không hợp lệ"
            });
        }

        // Ghi log
        const query1 = `INSERT INTO exam_violations (
            session_id, user_id, exam_id, violation_type, detail
        ) VALUES (?, ?, ?, ?, ?)`;
        const params1 = [sessionId, userId, examId, violationType, detail];
        
        logQuery('VIOLATION - INSERT', query1, params1);
        
        await db.promise().query(query1, params1);

        console.log(`⚠️ Violation: ${violationType} - User ${userId}`);

        // ✅ FIX: Simplified query without COLLATE
        const query2 = `SELECT 
            COUNT(*) as count, 
            s.max_violations
         FROM exam_violations v
         JOIN exam_sessions s ON v.session_id = s.id
         WHERE v.session_id = ?
         GROUP BY s.max_violations`;
         
        logQuery('VIOLATION - COUNT', query2, [sessionId]);
        
        const [stats] = await db.promise().query(query2, [sessionId]);

        const violationCount = stats[0]?.count || 0;
        const maxViolations = stats[0]?.max_violations || 3;

        // Nếu vượt quá max, force end
        if (violationCount >= maxViolations) {
            console.log(`🚫 Max violations (${maxViolations}) reached, force end`);
            
            const query3 = `UPDATE exam_sessions 
                 SET is_active = FALSE, 
                     end_time = NOW(), 
                     is_forced_end = TRUE
                 WHERE id = ?`;
                 
            logQuery('VIOLATION - FORCE END', query3, [sessionId]);
            
            await db.promise().query(query3, [sessionId]);

            return res.json({
                success: true,
                forceEnd: true,
                violationCount,
                maxViolations,
                message: `Đã vi phạm ${violationCount}/${maxViolations} lần. Bài thi bị kết thúc.`
            });
        }

        res.json({
            success: true,
            forceEnd: false,
            violationCount,
            maxViolations,
            message: `Vi phạm ${violationCount}/${maxViolations}`
        });

    } catch (err) {
        console.error("❌ Log violation error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        console.error("❌ SQL State:", err.sqlState);
        console.error("❌ Error Code:", err.code);
        res.status(500).json({ 
            success: false, 
            message: "Không thể ghi log vi phạm: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 📊 SUBMIT EXAM - Nộp bài thi
// ========================
router.post("/submit", async (req, res) => {
    try {
        const {
            sessionId,
            userId,
            examId,
            answers = {},
            isForced = false
        } = req.body;

        if (!sessionId || !userId || !examId) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin bắt buộc" 
            });
        }

        console.log(`📝 Submitting exam - Session: ${sessionId}`);

        // ✅ KIỂM TRA XEM ĐÃ NỘP BÀI CHƯA
        const checkQuery = "SELECT id FROM exam_results WHERE session_id = ?";
        logQuery('SUBMIT - CHECK EXISTING', checkQuery, [sessionId]);
        
        const [existing] = await db.promise().query(checkQuery, [sessionId]);
        
        if (existing.length > 0) {
            console.log(`⚠️ Session ${sessionId} already submitted`);
            
            // Lấy kết quả đã có
            const [existingResults] = await db.promise().query(
                "SELECT * FROM exam_results WHERE session_id = ?",
                [sessionId]
            );
            
            const result = existingResults[0];
            
            // ✅ FIX: Parse JSON safely
            let violationDetails = {};
            try {
                if (typeof result.violation_details === 'string') {
                    violationDetails = JSON.parse(result.violation_details || '{}');
                } else if (result.violation_details && typeof result.violation_details === 'object') {
                    violationDetails = result.violation_details;
                }
            } catch (e) {
                console.error('⚠️ Error parsing violation_details:', e);
                violationDetails = {};
            }
            
            return res.json({
                success: true,
                message: "Bài thi đã được nộp trước đó",
                alreadySubmitted: true,
                result: {
                    score: result.score,
                    totalPoints: result.total_points,
                    percentage: result.total_points > 0 ? ((result.score / result.total_points) * 100).toFixed(2) : 0,
                    correct: result.correct_answers,
                    wrong: result.wrong_answers,
                    unanswered: result.unanswered,
                    totalQuestions: result.total_questions,
                    violations: violationDetails,
                    totalViolations: result.total_violations,
                    passed: result.total_points > 0 && (result.score / result.total_points) >= 0.5
                }
            });
        }

        // ✅ KIỂM TRA XEM SESSION CÒN ACTIVE KHÔNG
        const [[sessionCheck]] = await db.promise().query(
            "SELECT is_active, is_forced_end FROM exam_sessions WHERE id = ?",
            [sessionId]
        );
        
        if (!sessionCheck) {
            return res.status(404).json({
                success: false,
                message: "Session không tồn tại"
            });
        }

        // Lấy câu hỏi và đáp án đúng
        const query1 = `SELECT 
            q.id as question_id, 
            q.points, 
            a.id as answer_id, 
            a.is_correct
         FROM questions q
         LEFT JOIN answers a ON q.id = a.question_id
         WHERE q.exam_id = ?
         ORDER BY q.id, a.id`;
         
        logQuery('SUBMIT - GET EXAM DATA', query1, [examId]);
        
        const [examData] = await db.promise().query(query1, [examId]);

        // Build question map
        const questionMap = {};
        examData.forEach(row => {
            if (!questionMap[row.question_id]) {
                questionMap[row.question_id] = {
                    points: row.points,
                    correctAnswer: null,
                    allAnswers: []
                };
            }
            questionMap[row.question_id].allAnswers.push(row.answer_id);
            if (row.is_correct) {
                questionMap[row.question_id].correctAnswer = row.answer_id;
            }
        });

        // Tính điểm
        let score = 0;
        let totalPoints = 0;
        let correct = 0;
        let wrong = 0;
        let unanswered = 0;

        Object.keys(questionMap).forEach(qid => {
            const q = questionMap[qid];
            totalPoints += q.points;

            const userAnswer = parseInt(answers[qid]);
            
            if (!userAnswer || !q.allAnswers.includes(userAnswer)) {
                unanswered++;
            } else if (userAnswer === q.correctAnswer) {
                score += q.points;
                correct++;
            } else {
                wrong++;
            }
        });

        // Lấy thống kê vi phạm
        const query2 = `SELECT violation_type, COUNT(*) as count
             FROM exam_violations
             WHERE session_id = ?
             GROUP BY violation_type`;
             
        logQuery('SUBMIT - GET VIOLATIONS', query2, [sessionId]);
        
        const [violations] = await db.promise().query(query2, [sessionId]);

        const violationDetails = {};
        let totalViolations = 0;
        
        violations.forEach(v => {
            violationDetails[v.violation_type] = v.count;
            totalViolations += v.count;
        });

        // Lấy thời gian bắt đầu
        const query3 = "SELECT start_time FROM exam_sessions WHERE id = ?";
        
        logQuery('SUBMIT - GET START TIME', query3, [sessionId]);
        
        const [[sessionInfo]] = await db.promise().query(query3, [sessionId]);

        // ✅ INSERT với ON DUPLICATE KEY UPDATE
        const query4 = `INSERT INTO exam_results (
            session_id, user_id, exam_id,
            score, total_points,
            total_questions, correct_answers, wrong_answers, unanswered,
            user_answers, total_violations, violation_details,
            start_time, time_taken, is_forced_submit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                  TIMESTAMPDIFF(SECOND, ?, NOW()), ?)
        ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            total_points = VALUES(total_points),
            correct_answers = VALUES(correct_answers),
            wrong_answers = VALUES(wrong_answers),
            unanswered = VALUES(unanswered),
            user_answers = VALUES(user_answers),
            total_violations = VALUES(total_violations),
            violation_details = VALUES(violation_details),
            time_taken = VALUES(time_taken),
            is_forced_submit = VALUES(is_forced_submit)`;
            
        const params4 = [
            sessionId, userId, examId,
            score, totalPoints,
            Object.keys(questionMap).length, correct, wrong, unanswered,
            JSON.stringify(answers),
            totalViolations,
            JSON.stringify(violationDetails),
            sessionInfo.start_time,
            sessionInfo.start_time,
            isForced
        ];
        
        logQuery('SUBMIT - INSERT RESULT', query4, params4);
        
        await db.promise().query(query4, params4);

        // Đóng session
        const query5 = `UPDATE exam_sessions 
             SET is_active = FALSE, end_time = NOW()
             WHERE id = ?`;
             
        logQuery('SUBMIT - CLOSE SESSION', query5, [sessionId]);
        
        await db.promise().query(query5, [sessionId]);

        console.log(`✅ Exam submitted - Score: ${score}/${totalPoints}`);

        res.json({
            success: true,
            message: "Nộp bài thành công",
            result: {
                score,
                totalPoints,
                percentage: totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(2) : 0,
                correct,
                wrong,
                unanswered,
                totalQuestions: Object.keys(questionMap).length,
                violations: violationDetails,
                totalViolations,
                passed: totalPoints > 0 && (score / totalPoints) >= 0.5
            }
        });

    } catch (err) {
        console.error("❌ Submit exam error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        console.error("❌ SQL State:", err.sqlState);
        console.error("❌ Error Code:", err.code);
        res.status(500).json({ 
            success: false, 
            message: "Không thể nộp bài: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 📈 GET RESULT - Lấy kết quả chi tiết
// ========================
router.get("/result/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const query = `SELECT 
            r.*,
            u.username,
            u.full_name,
            e.title as exam_title,
            e.duration as exam_duration,
            s.start_time,
            s.end_time,
            s.device_fingerprint,
            s.ip_address
         FROM exam_results r
         JOIN users u ON r.user_id = u.id
         JOIN exams e ON r.exam_id = e.id
         JOIN exam_sessions s ON r.session_id = s.id
         WHERE r.session_id = ?`;
         
        logQuery('GET RESULT', query, [sessionId]);
        
        const [results] = await db.promise().query(query, [sessionId]);

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy kết quả" 
            });
        }

        const result = results[0];

        // Parse JSON fields safely
        try {
            result.user_answers = typeof result.user_answers === 'string' 
                ? JSON.parse(result.user_answers) 
                : result.user_answers;
            
            result.violation_details = typeof result.violation_details === 'string' 
                ? JSON.parse(result.violation_details) 
                : result.violation_details;
            
            if (result.device_fingerprint) {
                result.device_info = typeof result.device_fingerprint === 'string'
                    ? JSON.parse(result.device_fingerprint)
                    : result.device_fingerprint;
            }
        } catch (e) {
            console.error('⚠️ Error parsing JSON fields:', e);
        }

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error("❌ Get result error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        console.error("❌ SQL State:", err.sqlState);
        console.error("❌ Error Code:", err.code);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy kết quả: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 📊 GET USER RESULTS - Lịch sử thi của user
// ========================
router.get("/results/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        const query = `SELECT 
            r.id,
            r.session_id,
            r.score,
            r.total_points,
            r.submit_time,
            r.time_taken,
            r.total_violations,
            r.is_forced_submit,
            e.title as exam_title,
            e.duration
         FROM exam_results r
         JOIN exams e ON r.exam_id = e.id
         WHERE r.user_id = ?
         ORDER BY r.submit_time DESC
         LIMIT ? OFFSET ?`;
         
        logQuery('GET USER RESULTS', query, [userId, parseInt(limit), parseInt(offset)]);
        
        const [results] = await db.promise().query(query, [userId, parseInt(limit), parseInt(offset)]);

        // Đếm tổng số
        const [[{ total }]] = await db.promise().query(
            "SELECT COUNT(*) as total FROM exam_results WHERE user_id = ?",
            [userId]
        );

        res.json({
            success: true,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data: results
        });

    } catch (err) {
        console.error("❌ Get user results error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy lịch sử thi: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 👁️ GET ACTIVE SESSIONS (Admin/Teacher)
// ========================
router.get("/active", async (req, res) => {
    try {
        const query = "SELECT * FROM active_sessions ORDER BY start_time DESC";
        
        logQuery('GET ACTIVE SESSIONS', query);
        
        const [sessions] = await db.promise().query(query);

        res.json({
            success: true,
            total: sessions.length,
            data: sessions
        });

    } catch (err) {
        console.error("❌ Get active sessions error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi lấy danh sách phiên thi: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

// ========================
// 🧹 CLEANUP STALE SESSIONS (Cron job endpoint)
// ========================
router.post("/cleanup", async (req, res) => {
    try {
        const query = "CALL CleanupStaleSessions()";
        
        logQuery('CLEANUP', query);
        
        await db.promise().query(query);
        
        res.json({
            success: true,
            message: "Đã dọn dẹp các phiên thi cũ"
        });

    } catch (err) {
        console.error("❌ Cleanup error:", err);
        console.error("❌ SQL Message:", err.sqlMessage);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi dọn dẹp: " + err.message,
            sqlError: err.sqlMessage
        });
    }
});

export default router;