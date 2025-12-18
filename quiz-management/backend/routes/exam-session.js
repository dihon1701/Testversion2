// // // import express from "express";
// // // import db from "../db.js";

// // // const router = express.Router();

// // // // ========================
// // // // 🚀 START SESSION - Bắt đầu phiên thi
// // // // ========================
// // // router.post("/start", (req, res) => {
// // //     const {
// // //         userId,
// // //         examId,
// // //         deviceInfo,
// // //         settings = {}
// // //     } = req.body;

// // //     if (!userId || !examId) {
// // //         return res.status(400).json({ 
// // //             success: false, 
// // //             message: "Thiếu userId hoặc examId" 
// // //         });
// // //     }

// // //     // Tạo session ID unique
// // //     const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// // //     // Kiểm tra xem user có session active không
// // //     const checkSql = `
// // //         SELECT id, start_time 
// // //         FROM exam_sessions 
// // //         WHERE user_id = ? AND exam_id = ? AND is_active = TRUE
// // //     `;

// // //     db.query(checkSql, [userId, examId], (err, existingSessions) => {
// // //         if (err) {
// // //             console.error("❌ Check session error:", err);
// // //             return res.status(500).json({ 
// // //                 success: false, 
// // //                 message: "Lỗi kiểm tra session" 
// // //             });
// // //         }

// // //         // Nếu có session cũ đang active
// // //         if (existingSessions.length > 0) {
// // //             console.log("⚠️ User có session active, kick session cũ");
            
// // //             // Gọi stored procedure kick session cũ
// // //             db.query(
// // //                 "CALL KickOldSession(?, ?, ?)",
// // //                 [userId, examId, sessionId],
// // //                 (err2) => {
// // //                     if (err2) {
// // //                         console.error("❌ Kick session error:", err2);
// // //                     }
// // //                 }
// // //             );
// // //         }

// // //         // Tạo session mới
// // //         const insertSql = `
// // //             INSERT INTO exam_sessions (
// // //                 id, user_id, exam_id,
// // //                 device_fingerprint, user_agent, ip_address,
// // //                 screen_resolution, timezone, platform,
// // //                 require_fullscreen, max_violations
// // //             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
// // //         `;

// // //         const values = [
// // //             sessionId,
// // //             userId,
// // //             examId,
// // //             JSON.stringify(deviceInfo || {}),
// // //             deviceInfo?.userAgent || null,
// // //             deviceInfo?.ipAddress || null,
// // //             deviceInfo?.screenResolution || null,
// // //             deviceInfo?.timezone || null,
// // //             deviceInfo?.platform || null,
// // //             settings.requireFullscreen !== false, // Default true
// // //             settings.maxViolations || 3
// // //         ];

// // //         db.query(insertSql, values, (err3, result) => {
// // //             if (err3) {
// // //                 console.error("❌ Create session error:", err3);
// // //                 return res.status(500).json({ 
// // //                     success: false, 
// // //                     message: "Không thể tạo session" 
// // //                 });
// // //             }

// // //             console.log("✅ Session created:", sessionId);

// // //             res.json({
// // //                 success: true,
// // //                 sessionId,
// // //                 message: "Bắt đầu phiên thi thành công",
// // //                 kicked: existingSessions.length > 0
// // //             });
// // //         });
// // //     });
// // // });

// // // // ========================
// // // // 💓 HEARTBEAT - Kiểm tra session còn hoạt động
// // // // ========================
// // // router.post("/heartbeat", (req, res) => {
// // //     const { sessionId } = req.body;

// // //     if (!sessionId) {
// // //         return res.status(400).json({ 
// // //             success: false, 
// // //             message: "Thiếu sessionId" 
// // //         });
// // //     }

// // //     const sql = `
// // //         SELECT id, is_active, is_forced_end 
// // //         FROM exam_sessions 
// // //         WHERE id = ?
// // //     `;

// // //     db.query(sql, [sessionId], (err, results) => {
// // //         if (err) {
// // //             console.error("❌ Heartbeat error:", err);
// // //             return res.status(500).json({ 
// // //                 success: false, 
// // //                 message: "Lỗi kiểm tra session" 
// // //             });
// // //         }

// // //         if (results.length === 0) {
// // //             return res.json({ 
// // //                 success: false, 
// // //                 valid: false, 
// // //                 message: "Session không tồn tại" 
// // //             });
// // //         }

// // //         const session = results[0];

// // //         // Cập nhật last_heartbeat
// // //         db.query(
// // //             "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id = ?",
// // //             [sessionId],
// // //             (err2) => {
// // //                 if (err2) console.error("❌ Update heartbeat error:", err2);
// // //             }
// // //         );

// // //         // Kiểm tra session có bị kick không
// // //         if (!session.is_active || session.is_forced_end) {
// // //             return res.json({
// // //                 success: true,
// // //                 valid: false,
// // //                 kicked: true,
// // //                 message: "Session đã bị đăng xuất do có phiên thi khác"
// // //             });
// // //         }

// // //         res.json({
// // //             success: true,
// // //             valid: true,
// // //             message: "Session đang hoạt động"
// // //         });
// // //     });
// // // });

// // // // ========================
// // // // 🚨 LOG VIOLATION - Ghi nhận vi phạm
// // // // ========================
// // // router.post("/violation", (req, res) => {
// // //     const {
// // //         sessionId,
// // //         userId,
// // //         examId,
// // //         violationType,
// // //         detail
// // //     } = req.body;

// // //     if (!sessionId || !userId || !examId || !violationType) {
// // //         return res.status(400).json({ 
// // //             success: false, 
// // //             message: "Thiếu thông tin bắt buộc" 
// // //         });
// // //     }

// // //     const sql = `
// // //         INSERT INTO exam_violations (
// // //             session_id, user_id, exam_id, violation_type, detail
// // //         ) VALUES (?, ?, ?, ?, ?)
// // //     `;

// // //     db.query(
// // //         sql,
// // //         [sessionId, userId, examId, violationType, detail],
// // //         (err, result) => {
// // //             if (err) {
// // //                 console.error("❌ Log violation error:", err);
// // //                 return res.status(500).json({ 
// // //                     success: false, 
// // //                     message: "Không thể ghi log" 
// // //                 });
// // //             }

// // //             console.log(`⚠️ Violation logged: ${violationType} - ${detail}`);

// // //             // Kiểm tra số lần vi phạm
// // //             const checkSql = `
// // //                 SELECT COUNT(*) as count, s.max_violations
// // //                 FROM exam_violations v
// // //                 JOIN exam_sessions s ON v.session_id = s.id
// // //                 WHERE v.session_id = ?
// // //                 GROUP BY s.max_violations
// // //             `;

// // //             db.query(checkSql, [sessionId], (err2, results) => {
// // //                 if (err2) {
// // //                     console.error("❌ Check violations error:", err2);
// // //                     return res.json({ success: true, forceEnd: false });
// // //                 }

// // //                 const count = results[0]?.count || 0;
// // //                 const maxViolations = results[0]?.max_violations || 3;

// // //                 if (count >= maxViolations) {
// // //                     console.log("🚫 Max violations reached, force end session");
                    
// // //                     // Đánh dấu session kết thúc
// // //                     db.query(
// // //                         `UPDATE exam_sessions 
// // //                          SET is_active = FALSE, end_time = NOW(), is_forced_end = TRUE
// // //                          WHERE id = ?`,
// // //                         [sessionId],
// // //                         (err3) => {
// // //                             if (err3) console.error("❌ Force end error:", err3);
// // //                         }
// // //                     );

// // //                     return res.json({
// // //                         success: true,
// // //                         forceEnd: true,
// // //                         message: "Đã vi phạm quá số lần cho phép"
// // //                     });
// // //                 }

// // //                 res.json({
// // //                     success: true,
// // //                     forceEnd: false,
// // //                     violationCount: count,
// // //                     maxViolations
// // //                 });
// // //             });
// // //         }
// // //     );
// // // });

// // // // ========================
// // // // 📊 SUBMIT EXAM - Nộp bài thi
// // // // ========================
// // // router.post("/submit", (req, res) => {
// // //     const {
// // //         sessionId,
// // //         userId,
// // //         examId,
// // //         answers, // { questionId: answerId }
// // //         isForced = false
// // //     } = req.body;

// // //     if (!sessionId || !userId || !examId) {
// // //         return res.status(400).json({ 
// // //             success: false, 
// // //             message: "Thiếu thông tin bắt buộc" 
// // //         });
// // //     }

// // //     // Lấy thông tin đề thi và câu hỏi
// // //     const examSql = `
// // //         SELECT q.id as question_id, q.points, a.id as answer_id, a.is_correct
// // //         FROM questions q
// // //         LEFT JOIN answers a ON q.id = a.question_id
// // //         WHERE q.exam_id = ?
// // //     `;

// // //     db.query(examSql, [examId], (err, examData) => {
// // //         if (err) {
// // //             console.error("❌ Get exam data error:", err);
// // //             return res.status(500).json({ 
// // //                 success: false, 
// // //                 message: "Lỗi lấy dữ liệu đề thi" 
// // //             });
// // //         }

// // //         // Tính điểm
// // //         let score = 0;
// // //         let totalPoints = 0;
// // //         let correct = 0;
// // //         let wrong = 0;
// // //         let unanswered = 0;

// // //         // Group theo question
// // //         const questionMap = {};
// // //         examData.forEach(row => {
// // //             if (!questionMap[row.question_id]) {
// // //                 questionMap[row.question_id] = {
// // //                     points: row.points,
// // //                     correctAnswer: null,
// // //                     answers: []
// // //                 };
// // //             }
// // //             if (row.is_correct) {
// // //                 questionMap[row.question_id].correctAnswer = row.answer_id;
// // //             }
// // //             questionMap[row.question_id].answers.push(row.answer_id);
// // //         });

// // //         // Tính điểm từng câu
// // //         Object.keys(questionMap).forEach(qid => {
// // //             const q = questionMap[qid];
// // //             totalPoints += q.points;

// // //             const userAnswer = answers[qid];
            
// // //             if (!userAnswer) {
// // //                 unanswered++;
// // //             } else if (userAnswer == q.correctAnswer) {
// // //                 score += q.points;
// // //                 correct++;
// // //             } else {
// // //                 wrong++;
// // //             }
// // //         });

// // //         // Lấy thống kê vi phạm
// // //         const violationSql = `
// // //             SELECT violation_type, COUNT(*) as count
// // //             FROM exam_violations
// // //             WHERE session_id = ?
// // //             GROUP BY violation_type
// // //         `;

// // //         db.query(violationSql, [sessionId], (err2, violations) => {
// // //             if (err2) {
// // //                 console.error("❌ Get violations error:", err2);
// // //             }

// // //             const violationDetails = {};
// // //             let totalViolations = 0;
            
// // //             (violations || []).forEach(v => {
// // //                 violationDetails[v.violation_type] = v.count;
// // //                 totalViolations += v.count;
// // //             });

// // //             // Lưu kết quả
// // //             const resultSql = `
// // //                 INSERT INTO exam_results (
// // //                     session_id, user_id, exam_id,
// // //                     score, total_points,
// // //                     total_questions, correct_answers, wrong_answers, unanswered,
// // //                     user_answers, total_violations, violation_details,
// // //                     start_time, time_taken, is_forced_submit
// // //                 )
// // //                 SELECT 
// // //                     ?, ?, ?,
// // //                     ?, ?,
// // //                     ?, ?, ?, ?,
// // //                     ?, ?, ?,
// // //                     start_time,
// // //                     TIMESTAMPDIFF(SECOND, start_time, NOW()),
// // //                     ?
// // //                 FROM exam_sessions WHERE id = ?
// // //             `;

// // //             db.query(
// // //                 resultSql,
// // //                 [
// // //                     sessionId, userId, examId,
// // //                     score, totalPoints,
// // //                     Object.keys(questionMap).length, correct, wrong, unanswered,
// // //                     JSON.stringify(answers),
// // //                     totalViolations,
// // //                     JSON.stringify(violationDetails),
// // //                     isForced,
// // //                     sessionId
// // //                 ],
// // //                 (err3, result) => {
// // //                     if (err3) {
// // //                         console.error("❌ Save result error:", err3);
// // //                         return res.status(500).json({ 
// // //                             success: false, 
// // //                             message: "Không thể lưu kết quả" 
// // //                         });
// // //                     }

// // //                     // Đóng session
// // //                     db.query(
// // //                         `UPDATE exam_sessions 
// // //                          SET is_active = FALSE, end_time = NOW()
// // //                          WHERE id = ?`,
// // //                         [sessionId],
// // //                         (err4) => {
// // //                             if (err4) console.error("❌ Close session error:", err4);
// // //                         }
// // //                     );

// // //                     console.log("✅ Exam submitted successfully");

// // //                     res.json({
// // //                         success: true,
// // //                         result: {
// // //                             score,
// // //                             totalPoints,
// // //                             percentage: ((score / totalPoints) * 100).toFixed(2),
// // //                             correct,
// // //                             wrong,
// // //                             unanswered,
// // //                             totalQuestions: Object.keys(questionMap).length,
// // //                             violations: violationDetails,
// // //                             totalViolations
// // //                         }
// // //                     });
// // //                 }
// // //             );
// // //         });
// // //     });
// // // });

// // // // ========================
// // // // 📈 GET RESULT - Lấy kết quả thi
// // // // ========================
// // // router.get("/result/:sessionId", (req, res) => {
// // //     const { sessionId } = req.params;

// // //     const sql = `
// // //         SELECT 
// // //             r.*,
// // //             u.username,
// // //             u.full_name,
// // //             e.title as exam_title,
// // //             s.start_time,
// // //             s.end_time
// // //         FROM exam_results r
// // //         JOIN users u ON r.user_id = u.id
// // //         JOIN exams e ON r.exam_id = e.id
// // //         JOIN exam_sessions s ON r.session_id = s.id
// // //         WHERE r.session_id = ?
// // //     `;

// // //     db.query(sql, [sessionId], (err, results) => {
// // //         if (err) {
// // //             console.error("❌ Get result error:", err);
// // //             return res.status(500).json({ 
// // //                 success: false, 
// // //                 message: "Lỗi lấy kết quả" 
// // //             });
// // //         }

// // //         if (results.length === 0) {
// // //             return res.status(404).json({ 
// // //                 success: false, 
// // //                 message: "Không tìm thấy kết quả" 
// // //             });
// // //         }

// // //         res.json({
// // //             success: true,
// // //             data: results[0]
// // //         });
// // //     });
// // // });

// // // // ========================
// // // // 📊 GET USER RESULTS - Lấy tất cả kết quả của user
// // // // ========================
// // // router.get("/results/user/:userId", (req, res) => {
// // //     const { userId } = req.params;

// // //     const sql = `
// // //         SELECT 
// // //             r.id,
// // //             r.score,
// // //             r.total_points,
// // //             r.submit_time,
// // //             r.time_taken,
// // //             r.total_violations,
// // //             e.title as exam_title,
// // //             e.duration
// // //         FROM exam_results r
// // //         JOIN exams e ON r.exam_id = e.id
// // //         WHERE r.user_id = ?
// // //         ORDER BY r.submit_time DESC
// // //     `;

// // //     db.query(sql, [userId], (err, results) => {
// // //         if (err) {
// // //             console.error("❌ Get user results error:", err);
// // //             return res.status(500).json({ 
// // //                 success: false, 
// // //                 message: "Lỗi lấy kết quả" 
// // //             });
// // //         }

// // //         res.json({
// // //             success: true,
// // //             total: results.length,
// // //             data: results
// // //         });
// // //     });
// // // });

// // // export default router;

// // import express from "express";
// // import db from "../db.js";

// // const router = express.Router();

// // // ========================
// // // 🚀 START SESSION - Sử dụng Stored Procedure
// // // ========================
// // router.post("/start", async (req, res) => {
// //     try {
// //         const {
// //             userId,
// //             examId,
// //             deviceInfo = {},
// //             settings = {}
// //         } = req.body;

// //         if (!userId || !examId) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Thiếu userId hoặc examId" 
// //             });
// //         }

// //         // Tạo session ID unique với timestamp + random
// //         const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// //         // Chuẩn bị device info dạng JSON
// //         const deviceJSON = JSON.stringify({
// //             browser: deviceInfo.browser || 'unknown',
// //             browserVersion: deviceInfo.browserVersion,
// //             os: deviceInfo.os,
// //             osVersion: deviceInfo.osVersion,
// //             screenResolution: deviceInfo.screenResolution,
// //             timezone: deviceInfo.timezone,
// //             language: deviceInfo.language,
// //             platform: deviceInfo.platform
// //         });

// //         console.log(`🚀 Starting session for User ${userId}, Exam ${examId}`);

// //         // Gọi stored procedure với promise
// //         const [results] = await db.promise().query(
// //             "CALL StartExamSession(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @kicked)",
// //             [
// //                 sessionId,
// //                 userId,
// //                 examId,
// //                 deviceJSON,
// //                 deviceInfo.userAgent || null,
// //                 deviceInfo.ipAddress || null,
// //                 deviceInfo.screenResolution || null,
// //                 deviceInfo.timezone || null,
// //                 deviceInfo.platform || null,
// //                 settings.requireFullscreen !== false, // Default true
// //                 settings.maxViolations || 3
// //             ]
// //         );

// //         // Lấy giá trị @kicked
// //         const [[{ '@kicked': wasKicked }]] = await db.promise().query('SELECT @kicked');

// //         console.log(`✅ Session created: ${sessionId}, Kicked old: ${wasKicked}`);

// //         res.json({
// //             success: true,
// //             sessionId,
// //             message: wasKicked 
// //                 ? "Phiên thi cũ đã bị đóng, bắt đầu phiên mới" 
// //                 : "Bắt đầu phiên thi thành công",
// //             kicked: wasKicked === 1,
// //             settings: {
// //                 requireFullscreen: settings.requireFullscreen !== false,
// //                 maxViolations: settings.maxViolations || 3
// //             }
// //         });

// //     } catch (err) {
// //         console.error("❌ Start session error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Không thể tạo phiên thi: " + err.message
// //         });
// //     }
// // });

// // // ========================
// // // 💓 HEARTBEAT - Kiểm tra session + Update timestamp
// // // ========================
// // router.post("/heartbeat", async (req, res) => {
// //     try {
// //         const { sessionId } = req.body;

// //         if (!sessionId) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Thiếu sessionId" 
// //             });
// //         }

// //         // Sử dụng function để check
// //         const [[{ valid }]] = await db.promise().query(
// //             "SELECT IsSessionValid(?) as valid",
// //             [sessionId]
// //         );

// //         if (!valid) {
// //             console.log(`⚠️ Session ${sessionId} is not valid (kicked or expired)`);
// //             return res.json({
// //                 success: true,
// //                 valid: false,
// //                 kicked: true,
// //                 message: "Phiên thi đã bị đóng do có phiên khác hoặc hết hạn"
// //             });
// //         }

// //         // Update heartbeat
// //         await db.promise().query(
// //             "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id = ?",
// //             [sessionId]
// //         );

// //         res.json({
// //             success: true,
// //             valid: true,
// //             message: "Session đang hoạt động"
// //         });

// //     } catch (err) {
// //         console.error("❌ Heartbeat error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             valid: false,
// //             message: "Lỗi kiểm tra session"
// //         });
// //     }
// // });

// // // ========================
// // // 🚨 LOG VIOLATION - Ghi nhận vi phạm
// // // ========================
// // router.post("/violation", async (req, res) => {
// //     try {
// //         const {
// //             sessionId,
// //             userId,
// //             examId,
// //             violationType,
// //             detail = ''
// //         } = req.body;

// //         if (!sessionId || !userId || !examId || !violationType) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Thiếu thông tin bắt buộc" 
// //             });
// //         }

// //         // Validate violation type
// //         const validTypes = [
// //             'TAB_SWITCH', 'WINDOW_BLUR', 'EXIT_FULLSCREEN',
// //             'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK',
// //             'KEYBOARD_SHORTCUT', 'DEVTOOLS_OPEN', 'MULTIPLE_SESSION'
// //         ];

// //         if (!validTypes.includes(violationType)) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Loại vi phạm không hợp lệ"
// //             });
// //         }

// //         // Ghi log
// //         await db.promise().query(
// //             `INSERT INTO exam_violations (
// //                 session_id, user_id, exam_id, violation_type, detail
// //             ) VALUES (?, ?, ?, ?, ?)`,
// //             [sessionId, userId, examId, violationType, detail]
// //         );

// //         console.log(`⚠️ Violation: ${violationType} - User ${userId}`);

// //         // Đếm số vi phạm và kiểm tra max
// //         const [[stats]] = await db.promise().query(
// //             `SELECT 
// //                 COUNT(*) as count, 
// //                 s.max_violations
// //              FROM exam_violations v
// //              JOIN exam_sessions s ON v.session_id = s.id
// //              WHERE v.session_id = ?
// //              GROUP BY s.max_violations`,
// //             [sessionId]
// //         );

// //         const violationCount = stats?.count || 0;
// //         const maxViolations = stats?.max_violations || 3;

// //         // Nếu vượt quá max, force end
// //         if (violationCount >= maxViolations) {
// //             console.log(`🚫 Max violations (${maxViolations}) reached, force end`);
            
// //             await db.promise().query(
// //                 `UPDATE exam_sessions 
// //                  SET is_active = FALSE, 
// //                      end_time = NOW(), 
// //                      is_forced_end = TRUE
// //                  WHERE id = ?`,
// //                 [sessionId]
// //             );

// //             return res.json({
// //                 success: true,
// //                 forceEnd: true,
// //                 violationCount,
// //                 maxViolations,
// //                 message: `Đã vi phạm ${violationCount}/${maxViolations} lần. Bài thi bị kết thúc.`
// //             });
// //         }

// //         res.json({
// //             success: true,
// //             forceEnd: false,
// //             violationCount,
// //             maxViolations,
// //             message: `Vi phạm ${violationCount}/${maxViolations}`
// //         });

// //     } catch (err) {
// //         console.error("❌ Log violation error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Không thể ghi log vi phạm"
// //         });
// //     }
// // });

// // // ========================
// // // 📊 SUBMIT EXAM - Nộp bài thi
// // // ========================
// // router.post("/submit", async (req, res) => {
// //     try {
// //         const {
// //             sessionId,
// //             userId,
// //             examId,
// //             answers = {}, // { questionId: answerId }
// //             isForced = false
// //         } = req.body;

// //         if (!sessionId || !userId || !examId) {
// //             return res.status(400).json({ 
// //                 success: false, 
// //                 message: "Thiếu thông tin bắt buộc" 
// //             });
// //         }

// //         console.log(`📝 Submitting exam - Session: ${sessionId}`);

// //         // Lấy câu hỏi và đáp án đúng
// //         const [examData] = await db.promise().query(
// //             `SELECT 
// //                 q.id as question_id, 
// //                 q.points, 
// //                 a.id as answer_id, 
// //                 a.is_correct
// //              FROM questions q
// //              LEFT JOIN answers a ON q.id = a.question_id
// //              WHERE q.exam_id = ?
// //              ORDER BY q.id, a.id`,
// //             [examId]
// //         );

// //         // Build question map
// //         const questionMap = {};
// //         examData.forEach(row => {
// //             if (!questionMap[row.question_id]) {
// //                 questionMap[row.question_id] = {
// //                     points: row.points,
// //                     correctAnswer: null,
// //                     allAnswers: []
// //                 };
// //             }
// //             questionMap[row.question_id].allAnswers.push(row.answer_id);
// //             if (row.is_correct) {
// //                 questionMap[row.question_id].correctAnswer = row.answer_id;
// //             }
// //         });

// //         // Tính điểm
// //         let score = 0;
// //         let totalPoints = 0;
// //         let correct = 0;
// //         let wrong = 0;
// //         let unanswered = 0;

// //         Object.keys(questionMap).forEach(qid => {
// //             const q = questionMap[qid];
// //             totalPoints += q.points;

// //             const userAnswer = parseInt(answers[qid]);
            
// //             if (!userAnswer || !q.allAnswers.includes(userAnswer)) {
// //                 unanswered++;
// //             } else if (userAnswer === q.correctAnswer) {
// //                 score += q.points;
// //                 correct++;
// //             } else {
// //                 wrong++;
// //             }
// //         });

// //         // Lấy thống kê vi phạm
// //         const [violations] = await db.promise().query(
// //             `SELECT violation_type, COUNT(*) as count
// //              FROM exam_violations
// //              WHERE session_id = ?
// //              GROUP BY violation_type`,
// //             [sessionId]
// //         );

// //         const violationDetails = {};
// //         let totalViolations = 0;
        
// //         violations.forEach(v => {
// //             violationDetails[v.violation_type] = v.count;
// //             totalViolations += v.count;
// //         });

// //         // Lấy thời gian bắt đầu
// //         const [[sessionInfo]] = await db.promise().query(
// //             "SELECT start_time FROM exam_sessions WHERE id = ?",
// //             [sessionId]
// //         );

// //         // Lưu kết quả
// //         await db.promise().query(
// //             `INSERT INTO exam_results (
// //                 session_id, user_id, exam_id,
// //                 score, total_points,
// //                 total_questions, correct_answers, wrong_answers, unanswered,
// //                 user_answers, total_violations, violation_details,
// //                 start_time, time_taken, is_forced_submit
// //             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
// //                       TIMESTAMPDIFF(SECOND, ?, NOW()), ?)`,
// //             [
// //                 sessionId, userId, examId,
// //                 score, totalPoints,
// //                 Object.keys(questionMap).length, correct, wrong, unanswered,
// //                 JSON.stringify(answers),
// //                 totalViolations,
// //                 JSON.stringify(violationDetails),
// //                 sessionInfo.start_time,
// //                 sessionInfo.start_time,
// //                 isForced
// //             ]
// //         );

// //         // Đóng session
// //         await db.promise().query(
// //             `UPDATE exam_sessions 
// //              SET is_active = FALSE, end_time = NOW()
// //              WHERE id = ?`,
// //             [sessionId]
// //         );

// //         console.log(`✅ Exam submitted - Score: ${score}/${totalPoints}`);

// //         res.json({
// //             success: true,
// //             message: "Nộp bài thành công",
// //             result: {
// //                 score,
// //                 totalPoints,
// //                 percentage: totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(2) : 0,
// //                 correct,
// //                 wrong,
// //                 unanswered,
// //                 totalQuestions: Object.keys(questionMap).length,
// //                 violations: violationDetails,
// //                 totalViolations,
// //                 passed: totalPoints > 0 && (score / totalPoints) >= 0.5
// //             }
// //         });

// //     } catch (err) {
// //         console.error("❌ Submit exam error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Không thể nộp bài: " + err.message
// //         });
// //     }
// // });

// // // ========================
// // // 📈 GET RESULT - Lấy kết quả chi tiết
// // // ========================
// // router.get("/result/:sessionId", async (req, res) => {
// //     try {
// //         const { sessionId } = req.params;

// //         const [results] = await db.promise().query(
// //             `SELECT 
// //                 r.*,
// //                 u.username,
// //                 u.full_name,
// //                 e.title as exam_title,
// //                 e.duration as exam_duration,
// //                 s.start_time,
// //                 s.end_time,
// //                 s.device_fingerprint,
// //                 s.ip_address
// //              FROM exam_results r
// //              JOIN users u ON r.user_id = u.id
// //              JOIN exams e ON r.exam_id = e.id
// //              JOIN exam_sessions s ON r.session_id = s.id
// //              WHERE r.session_id = ?`,
// //             [sessionId]
// //         );

// //         if (results.length === 0) {
// //             return res.status(404).json({ 
// //                 success: false, 
// //                 message: "Không tìm thấy kết quả" 
// //             });
// //         }

// //         const result = results[0];

// //         // Parse JSON fields
// //         result.user_answers = JSON.parse(result.user_answers);
// //         result.violation_details = JSON.parse(result.violation_details);
// //         if (result.device_fingerprint) {
// //             result.device_info = JSON.parse(result.device_fingerprint);
// //         }

// //         res.json({
// //             success: true,
// //             data: result
// //         });

// //     } catch (err) {
// //         console.error("❌ Get result error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Lỗi lấy kết quả"
// //         });
// //     }
// // });

// // // ========================
// // // 📊 GET USER RESULTS - Lịch sử thi của user
// // // ========================
// // router.get("/results/user/:userId", async (req, res) => {
// //     try {
// //         const { userId } = req.params;
// //         const { limit = 20, offset = 0 } = req.query;

// //         const [results] = await db.promise().query(
// //             `SELECT 
// //                 r.id,
// //                 r.session_id,
// //                 r.score,
// //                 r.total_points,
// //                 r.submit_time,
// //                 r.time_taken,
// //                 r.total_violations,
// //                 r.is_forced_submit,
// //                 e.title as exam_title,
// //                 e.duration
// //              FROM exam_results r
// //              JOIN exams e ON r.exam_id = e.id
// //              WHERE r.user_id = ?
// //              ORDER BY r.submit_time DESC
// //              LIMIT ? OFFSET ?`,
// //             [userId, parseInt(limit), parseInt(offset)]
// //         );

// //         // Đếm tổng số
// //         const [[{ total }]] = await db.promise().query(
// //             "SELECT COUNT(*) as total FROM exam_results WHERE user_id = ?",
// //             [userId]
// //         );

// //         res.json({
// //             success: true,
// //             total,
// //             limit: parseInt(limit),
// //             offset: parseInt(offset),
// //             data: results
// //         });

// //     } catch (err) {
// //         console.error("❌ Get user results error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Lỗi lấy lịch sử thi"
// //         });
// //     }
// // });

// // // ========================
// // // 👁️ GET ACTIVE SESSIONS (Admin/Teacher)
// // // ========================
// // router.get("/active", async (req, res) => {
// //     try {
// //         const [sessions] = await db.promise().query(
// //             "SELECT * FROM active_sessions ORDER BY start_time DESC"
// //         );

// //         res.json({
// //             success: true,
// //             total: sessions.length,
// //             data: sessions
// //         });

// //     } catch (err) {
// //         console.error("❌ Get active sessions error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Lỗi lấy danh sách phiên thi"
// //         });
// //     }
// // });

// // // ========================
// // // 🧹 CLEANUP STALE SESSIONS (Cron job endpoint)
// // // ========================
// // router.post("/cleanup", async (req, res) => {
// //     try {
// //         await db.promise().query("CALL CleanupStaleSessions()");
        
// //         res.json({
// //             success: true,
// //             message: "Đã dọn dẹp các phiên thi cũ"
// //         });

// //     } catch (err) {
// //         console.error("❌ Cleanup error:", err);
// //         res.status(500).json({ 
// //             success: false, 
// //             message: "Lỗi dọn dẹp"
// //         });
// //     }
// // });

// // export default router;

// import express from "express";
// import db from "../db.js";

// const router = express.Router();

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
//         const [results] = await db.promise().query(
//             "CALL StartExamSession(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @kicked)",
//             [
//                 sessionId,
//                 userId,
//                 examId,
//                 deviceJSON,
//                 deviceInfo.userAgent || null,
//                 deviceInfo.ipAddress || null,
//                 deviceInfo.screenResolution || null,
//                 deviceInfo.timezone || null,
//                 deviceInfo.platform || null,
//                 settings.requireFullscreen !== false, // Default true
//                 settings.maxViolations || 3
//             ]
//         );

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
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể tạo phiên thi: " + err.message
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
//         const [[{ valid }]] = await db.promise().query(
//             "SELECT IsSessionValid(?) as valid",
//             [sessionId]
//         );

//         if (!valid) {
//             console.log(`⚠️ Session ${sessionId} is not valid (kicked or expired)`);
//             return res.json({
//                 success: true,
//                 valid: false,
//                 kicked: true,
//                 message: "Phiên thi đã bị đóng do có phiên khác hoặc hết hạn"
//             });
//         }

//         // ✅ FIX: Update heartbeat với COLLATE
//         await db.promise().query(
//             "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id COLLATE utf8mb4_unicode_ci = ?",
//             [sessionId]
//         );

//         res.json({
//             success: true,
//             valid: true,
//             message: "Session đang hoạt động"
//         });

//     } catch (err) {
//         console.error("❌ Heartbeat error:", err);
//         res.status(500).json({ 
//             success: false, 
//             valid: false,
//             message: "Lỗi kiểm tra session: " + err.message
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
//         await db.promise().query(
//             `INSERT INTO exam_violations (
//                 session_id, user_id, exam_id, violation_type, detail
//             ) VALUES (?, ?, ?, ?, ?)`,
//             [sessionId, userId, examId, violationType, detail]
//         );

//         console.log(`⚠️ Violation: ${violationType} - User ${userId}`);

//         // ✅ FIX: Đếm số vi phạm với COLLATE explicit
//         const [[stats]] = await db.promise().query(
//             `SELECT 
//                 COUNT(*) as count, 
//                 s.max_violations
//              FROM exam_violations v
//              JOIN exam_sessions s ON v.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
//              WHERE v.session_id COLLATE utf8mb4_unicode_ci = ?
//              GROUP BY s.max_violations`,
//             [sessionId]
//         );

//         const violationCount = stats?.count || 0;
//         const maxViolations = stats?.max_violations || 3;

//         // Nếu vượt quá max, force end
//         if (violationCount >= maxViolations) {
//             console.log(`🚫 Max violations (${maxViolations}) reached, force end`);
            
//             await db.promise().query(
//                 `UPDATE exam_sessions 
//                  SET is_active = FALSE, 
//                      end_time = NOW(), 
//                      is_forced_end = TRUE
//                  WHERE id COLLATE utf8mb4_unicode_ci = ?`,
//                 [sessionId]
//             );

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
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể ghi log vi phạm: " + err.message
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
//             answers = {}, // { questionId: answerId }
//             isForced = false
//         } = req.body;

//         if (!sessionId || !userId || !examId) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Thiếu thông tin bắt buộc" 
//             });
//         }

//         console.log(`📝 Submitting exam - Session: ${sessionId}`);

//         // Lấy câu hỏi và đáp án đúng
//         const [examData] = await db.promise().query(
//             `SELECT 
//                 q.id as question_id, 
//                 q.points, 
//                 a.id as answer_id, 
//                 a.is_correct
//              FROM questions q
//              LEFT JOIN answers a ON q.id = a.question_id
//              WHERE q.exam_id = ?
//              ORDER BY q.id, a.id`,
//             [examId]
//         );

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

//         // ✅ FIX: Lấy thống kê vi phạm với COLLATE
//         const [violations] = await db.promise().query(
//             `SELECT violation_type, COUNT(*) as count
//              FROM exam_violations
//              WHERE session_id COLLATE utf8mb4_unicode_ci = ?
//              GROUP BY violation_type`,
//             [sessionId]
//         );

//         const violationDetails = {};
//         let totalViolations = 0;
        
//         violations.forEach(v => {
//             violationDetails[v.violation_type] = v.count;
//             totalViolations += v.count;
//         });

//         // ✅ FIX: Lấy thời gian bắt đầu với COLLATE
//         const [[sessionInfo]] = await db.promise().query(
//             "SELECT start_time FROM exam_sessions WHERE id COLLATE utf8mb4_unicode_ci = ?",
//             [sessionId]
//         );

//         // Lưu kết quả
//         await db.promise().query(
//             `INSERT INTO exam_results (
//                 session_id, user_id, exam_id,
//                 score, total_points,
//                 total_questions, correct_answers, wrong_answers, unanswered,
//                 user_answers, total_violations, violation_details,
//                 start_time, time_taken, is_forced_submit
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
//                       TIMESTAMPDIFF(SECOND, ?, NOW()), ?)`,
//             [
//                 sessionId, userId, examId,
//                 score, totalPoints,
//                 Object.keys(questionMap).length, correct, wrong, unanswered,
//                 JSON.stringify(answers),
//                 totalViolations,
//                 JSON.stringify(violationDetails),
//                 sessionInfo.start_time,
//                 sessionInfo.start_time,
//                 isForced
//             ]
//         );

//         // ✅ FIX: Đóng session với COLLATE
//         await db.promise().query(
//             `UPDATE exam_sessions 
//              SET is_active = FALSE, end_time = NOW()
//              WHERE id COLLATE utf8mb4_unicode_ci = ?`,
//             [sessionId]
//         );

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
//         res.status(500).json({ 
//             success: false, 
//             message: "Không thể nộp bài: " + err.message
//         });
//     }
// });

// // ========================
// // 📈 GET RESULT - Lấy kết quả chi tiết
// // ========================
// router.get("/result/:sessionId", async (req, res) => {
//     try {
//         const { sessionId } = req.params;

//         // ✅ FIX: JOIN với COLLATE explicit
//         const [results] = await db.promise().query(
//             `SELECT 
//                 r.*,
//                 u.username,
//                 u.full_name,
//                 e.title as exam_title,
//                 e.duration as exam_duration,
//                 s.start_time,
//                 s.end_time,
//                 s.device_fingerprint,
//                 s.ip_address
//              FROM exam_results r
//              JOIN users u ON r.user_id = u.id
//              JOIN exams e ON r.exam_id = e.id
//              JOIN exam_sessions s ON r.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
//              WHERE r.session_id COLLATE utf8mb4_unicode_ci = ?`,
//             [sessionId]
//         );

//         if (results.length === 0) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Không tìm thấy kết quả" 
//             });
//         }

//         const result = results[0];

//         // Parse JSON fields
//         result.user_answers = JSON.parse(result.user_answers);
//         result.violation_details = JSON.parse(result.violation_details);
//         if (result.device_fingerprint) {
//             result.device_info = JSON.parse(result.device_fingerprint);
//         }

//         res.json({
//             success: true,
//             data: result
//         });

//     } catch (err) {
//         console.error("❌ Get result error:", err);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy kết quả: " + err.message
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

//         const [results] = await db.promise().query(
//             `SELECT 
//                 r.id,
//                 r.session_id,
//                 r.score,
//                 r.total_points,
//                 r.submit_time,
//                 r.time_taken,
//                 r.total_violations,
//                 r.is_forced_submit,
//                 e.title as exam_title,
//                 e.duration
//              FROM exam_results r
//              JOIN exams e ON r.exam_id = e.id
//              WHERE r.user_id = ?
//              ORDER BY r.submit_time DESC
//              LIMIT ? OFFSET ?`,
//             [userId, parseInt(limit), parseInt(offset)]
//         );

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
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy lịch sử thi: " + err.message
//         });
//     }
// });

// // ========================
// // 👁️ GET ACTIVE SESSIONS (Admin/Teacher)
// // ========================
// router.get("/active", async (req, res) => {
//     try {
//         const [sessions] = await db.promise().query(
//             "SELECT * FROM active_sessions ORDER BY start_time DESC"
//         );

//         res.json({
//             success: true,
//             total: sessions.length,
//             data: sessions
//         });

//     } catch (err) {
//         console.error("❌ Get active sessions error:", err);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi lấy danh sách phiên thi: " + err.message
//         });
//     }
// });

// // ========================
// // 🧹 CLEANUP STALE SESSIONS (Cron job endpoint)
// // ========================
// router.post("/cleanup", async (req, res) => {
//     try {
//         await db.promise().query("CALL CleanupStaleSessions()");
        
//         res.json({
//             success: true,
//             message: "Đã dọn dẹp các phiên thi cũ"
//         });

//     } catch (err) {
//         console.error("❌ Cleanup error:", err);
//         res.status(500).json({ 
//             success: false, 
//             message: "Lỗi dọn dẹp: " + err.message
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
// 💓 HEARTBEAT - Kiểm tra session + Update timestamp
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

        // Sử dụng function để check
        const query1 = "SELECT IsSessionValid(?) as valid";
        logQuery('HEARTBEAT - CHECK', query1, [sessionId]);
        
        const [[{ valid }]] = await db.promise().query(query1, [sessionId]);

        if (!valid) {
            console.log(`⚠️ Session ${sessionId} is not valid (kicked or expired)`);
            return res.json({
                success: true,
                valid: false,
                kicked: true,
                message: "Phiên thi đã bị đóng do có phiên khác hoặc hết hạn"
            });
        }

        // Update heartbeat
        const query2 = "UPDATE exam_sessions SET last_heartbeat = NOW() WHERE id COLLATE utf8mb4_unicode_ci = ?";
        logQuery('HEARTBEAT - UPDATE', query2, [sessionId]);
        
        await db.promise().query(query2, [sessionId]);

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

        // Đếm số vi phạm với COLLATE explicit
        const query2 = `SELECT 
            COUNT(*) as count, 
            s.max_violations
         FROM exam_violations v
         JOIN exam_sessions s ON v.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
         WHERE v.session_id COLLATE utf8mb4_unicode_ci = ?
         GROUP BY s.max_violations`;
         
        logQuery('VIOLATION - COUNT', query2, [sessionId]);
        
        const [[stats]] = await db.promise().query(query2, [sessionId]);

        const violationCount = stats?.count || 0;
        const maxViolations = stats?.max_violations || 3;

        // Nếu vượt quá max, force end
        if (violationCount >= maxViolations) {
            console.log(`🚫 Max violations (${maxViolations}) reached, force end`);
            
            const query3 = `UPDATE exam_sessions 
                 SET is_active = FALSE, 
                     end_time = NOW(), 
                     is_forced_end = TRUE
                 WHERE id COLLATE utf8mb4_unicode_ci = ?`;
                 
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
        const checkQuery = "SELECT id FROM exam_results WHERE session_id COLLATE utf8mb4_unicode_ci = ?";
        logQuery('SUBMIT - CHECK EXISTING', checkQuery, [sessionId]);
        
        const [existing] = await db.promise().query(checkQuery, [sessionId]);
        
        if (existing.length > 0) {
            console.log(`⚠️ Session ${sessionId} already submitted`);
            
            // Lấy kết quả đã có
            const [existingResults] = await db.promise().query(
                "SELECT * FROM exam_results WHERE session_id COLLATE utf8mb4_unicode_ci = ?",
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
            "SELECT is_active, is_forced_end FROM exam_sessions WHERE id COLLATE utf8mb4_unicode_ci = ?",
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
             WHERE session_id COLLATE utf8mb4_unicode_ci = ?
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
        const query3 = "SELECT start_time FROM exam_sessions WHERE id COLLATE utf8mb4_unicode_ci = ?";
        
        logQuery('SUBMIT - GET START TIME', query3, [sessionId]);
        
        const [[sessionInfo]] = await db.promise().query(query3, [sessionId]);

        // ✅ INSERT với ON DUPLICATE KEY UPDATE (để tránh lỗi duplicate)
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
             WHERE id COLLATE utf8mb4_unicode_ci = ?`;
             
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

        // JOIN với COLLATE explicit
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
         JOIN exam_sessions s ON r.session_id COLLATE utf8mb4_unicode_ci = s.id COLLATE utf8mb4_unicode_ci
         WHERE r.session_id COLLATE utf8mb4_unicode_ci = ?`;
         
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