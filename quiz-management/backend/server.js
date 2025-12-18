// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import db from "./db.js";
// import authRoutes from "./routes/auth.js";
// import examSessionRoutes from "./routes/exam-session.js";
// import { verifyToken } from "./middlewares/authMiddleware.js";
// import { verifyRole } from "./middlewares/roleMiddleware.js";

// const app = express();

// // ========================
// // 🌐 CORS
// // ========================
// // app.use(
// //     cors({
// //         origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
// //         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //         credentials: true,
// //     })
// // );
// app.use(
//     cors({
//         origin: process.env.FRONTEND_URL || "http://localhost:3000",
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         credentials: true,
//     })
// );

// app.use(express.json());

// // ========================
// // 📜 Log mọi request
// // ========================
// app.use((req, res, next) => {
//     console.log(`📨 ${req.method} ${req.url}`);
//     console.log("Body:", req.body);
//     next();
// });

// // ========================
// // 🧪 Test endpoint
// // ========================
// app.get("/api/test", (req, res) => {
//     res.json({ message: "Backend hoạt động!", time: new Date().toISOString() });
// });

// // ========================
// // 🔐 Routes (Public - không cần đăng nhập)
// // ========================
// app.use("/api/auth", authRoutes);

// // ========================
// // 🎓 Exam Session Routes (Student only)
// // ========================
// app.use("/api/exam-session", examSessionRoutes);

// // ========================
// // 📝 POST: Lưu đề thi (Teacher & Admin only)
// // ========================
// app.post("/api/exams", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     console.log("🎯 POST /api/exams");

//     const { title, duration, parts, questions, tags, description } = req.body;

//     if (!title || !questions) {
//         return res.status(400).json({ message: "Thiếu title hoặc questions" });
//     }

//     const sqlExam = `
//         INSERT INTO exams (title, description, duration, parts, tags) 
//         VALUES (?, ?, ?, ?, ?)
//     `;

//     db.query(
//         sqlExam,
//         [title, description || null, duration, parts, tags || null],
//         (err, result) => {
//             if (err) {
//                 console.error("❌ Database error:", err);
//                 return res
//                     .status(500)
//                     .json({ message: "Lỗi server", error: err.message });
//             }

//             const examId = result.insertId;
//             console.log("✅ Exam inserted, ID:", examId);

//             let parsedQuestions;
//             try {
//                 parsedQuestions = JSON.parse(questions);
//             } catch (e) {
//                 return res
//                     .status(400)
//                     .json({ message: "questions không phải JSON hợp lệ" });
//             }

//             if (parsedQuestions.length === 0) {
//                 return res.status(201).json({
//                     message: "Lưu thành công (không có câu hỏi)",
//                     examId,
//                     title,
//                 });
//             }

//             // Insert từng câu hỏi và đáp án
//             parsedQuestions.forEach((q, index) => {
//                 const sqlQuestion = `
//                     INSERT INTO questions (exam_id, question_text, order_index)
//                     VALUES (?, ?, ?)
//                 `;

//                 db.query(
//                     sqlQuestion,
//                     [examId, q.text, index],
//                     (err2, result2) => {
//                         if (err2) {
//                             console.error("❌ Insert question error:", err2);
//                             return;
//                         }

//                         const questionId = result2.insertId;

//                         if (q.answers && q.answers.length > 0) {
//                             q.answers.forEach((a, aIndex) => {
//                                 const sqlAnswer = `
//                                     INSERT INTO answers (question_id, answer_text, is_correct, order_index)
//                                     VALUES (?, ?, ?, ?)
//                                 `;
//                                 db.query(
//                                     sqlAnswer,
//                                     [
//                                         questionId,
//                                         a.text,
//                                         a.isCorrect || false,
//                                         aIndex,
//                                     ],
//                                     (err3) => {
//                                         if (err3)
//                                             console.error(
//                                                 "❌ Insert answer error:",
//                                                 err3
//                                             );
//                                     }
//                                 );
//                             });
//                         }
//                     }
//                 );
//             });

//             res.status(201).json({
//                 message: "Lưu đề thành công!",
//                 examId,
//                 title,
//                 totalQuestions: parsedQuestions.length,
//             });
//         }
//     );
// });

// // ========================
// // 📋 GET: Lấy danh sách đề thi (Tất cả user đã đăng nhập)
// // ========================
// app.get("/api/exams", verifyToken, (req, res) => {
//     console.log("📋 GET /api/exams");

//     const sql = `
//         SELECT 
//             e.id,
//             e.title,
//             e.description,
//             e.duration,
//             e.parts,
//             e.tags,
//             e.created_at,
//             COUNT(DISTINCT q.id) AS questions
//         FROM exams e
//         LEFT JOIN questions q ON e.id = q.exam_id
//         GROUP BY e.id
//         ORDER BY e.created_at DESC
//     `;

//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ Database error:", err);
//             return res
//                 .status(500)
//                 .json({ message: "Lỗi server", error: err.message });
//         }

//         console.log(`✅ Found ${results.length} exams`);

//         res.json({
//             message: "Lấy danh sách thành công",
//             total: results.length,
//             data: results,
//         });
//     });
// });

// // ========================
// // 📌 GET: Lấy 1 đề theo ID (Tất cả user đã đăng nhập)
// // ========================
// app.get("/api/exams/:id", verifyToken, (req, res) => {
//     const examId = req.params.id;
//     console.log(`🔍 GET /api/exams/${examId}`);

//     const sqlExam = `SELECT * FROM exams WHERE id = ?`;
//     const sqlQuestions = `SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index`;
//     const sqlAnswers = `SELECT * FROM answers WHERE question_id IN (SELECT id FROM questions WHERE exam_id = ?) ORDER BY order_index`;

//     db.query(sqlExam, [examId], (err, exam) => {
//         if (err) return res.status(500).json({ message: "Lỗi DB", error: err.message });

//         if (exam.length === 0) {
//             console.log("❌ Không tìm thấy đề thi ID:", examId);
//             return res.status(404).json({ message: "Không tìm thấy đề thi" });
//         }

//         db.query(sqlQuestions, [examId], (err2, questions) => {
//             if (err2) return res.status(500).json({ error: err2.message });

//             db.query(sqlAnswers, [examId], (err3, answers) => {
//                 if (err3) return res.status(500).json({ error: err3.message });

//                 console.log("✅ Trả về đầy đủ đề thi");
//                 res.json({
//                     exam: exam[0],
//                     questions: questions,
//                     answers: answers
//                 });
//             });
//         });
//     });
// });

// // ========================
// // 🗑️ DELETE: Xóa đề thi (Teacher & Admin only)
// // ========================
// app.delete("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const examId = req.params.id;
//     console.log(`🗑️ DELETE /api/exams/${examId}`);

//     const sqlCheck = `SELECT id, title FROM exams WHERE id = ?`;
    
//     db.query(sqlCheck, [examId], (err, result) => {
//         if (err) {
//             console.error("❌ Database error:", err);
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         if (result.length === 0) {
//             console.log("❌ Không tìm thấy đề thi ID:", examId);
//             return res.status(404).json({ 
//                 message: "Không tìm thấy đề thi" 
//             });
//         }

//         const examTitle = result[0].title;
//         const sqlDelete = `DELETE FROM exams WHERE id = ?`;
        
//         db.query(sqlDelete, [examId], (err2, deleteResult) => {
//             if (err2) {
//                 console.error("❌ Delete error:", err2);
//                 return res.status(500).json({ 
//                     message: "Lỗi khi xóa đề thi", 
//                     error: err2.message 
//                 });
//             }

//             console.log(`✅ Đã xóa đề thi: ${examTitle}`);
//             res.json({ 
//                 message: `Đã xóa thành công đề thi: ${examTitle}`,
//                 examId: examId,
//                 examTitle: examTitle
//             });
//         });
//     });
// });

// // ========================
// // ✏️ PUT: Cập nhật đề thi (Teacher & Admin only)
// // ========================
// app.put("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const examId = req.params.id;
//     console.log(`✏️ PUT /api/exams/${examId}`);

//     const { title, description, duration, parts, tags } = req.body;

//     if (!title || !duration) {
//         return res.status(400).json({ 
//             message: "Thiếu thông tin: title và duration là bắt buộc" 
//         });
//     }

//     if (duration <= 0) {
//         return res.status(400).json({ 
//             message: "Thời gian thi phải lớn hơn 0" 
//         });
//     }

//     const sqlCheck = `SELECT id FROM exams WHERE id = ?`;
    
//     db.query(sqlCheck, [examId], (err, result) => {
//         if (err) {
//             console.error("❌ Database error:", err);
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         if (result.length === 0) {
//             console.log("❌ Không tìm thấy đề thi ID:", examId);
//             return res.status(404).json({ 
//                 message: "Không tìm thấy đề thi" 
//             });
//         }

//         const sqlUpdate = `
//             UPDATE exams 
//             SET title = ?, 
//                 description = ?, 
//                 duration = ?, 
//                 parts = ?, 
//                 tags = ?,
//                 updated_at = CURRENT_TIMESTAMP
//             WHERE id = ?
//         `;

//         db.query(
//             sqlUpdate,
//             [title, description || null, duration, parts || 1, tags || null, examId],
//             (err2, updateResult) => {
//                 if (err2) {
//                     console.error("❌ Update error:", err2);
//                     return res.status(500).json({ 
//                         message: "Lỗi khi cập nhật đề thi", 
//                         error: err2.message 
//                     });
//                 }

//                 console.log(`✅ Đã cập nhật đề thi ID: ${examId}`);
//                 res.json({ 
//                     message: "Cập nhật đề thi thành công!",
//                     examId: examId,
//                     title: title,
//                     updatedFields: { title, description, duration, parts, tags }
//                 });
//             }
//         );
//     });
// });

// // ========================
// // 📖 GET: Lấy chi tiết đề thi để chỉnh sửa (Teacher & Admin only)
// // ========================
// app.get("/api/exams/:id/full", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const examId = req.params.id;
//     console.log(`📖 GET /api/exams/${examId}/full`);

//     const sqlExam = `SELECT * FROM exams WHERE id = ?`;
//     const sqlQuestions = `SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index`;
//     const sqlAnswers = `
//         SELECT a.* 
//         FROM answers a
//         INNER JOIN questions q ON a.question_id = q.id
//         WHERE q.exam_id = ?
//         ORDER BY q.order_index, a.order_index
//     `;

//     db.query(sqlExam, [examId], (err, examResult) => {
//         if (err) {
//             console.error("❌ Database error:", err);
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         if (examResult.length === 0) {
//             console.log("❌ Không tìm thấy đề thi ID:", examId);
//             return res.status(404).json({ 
//                 message: "Không tìm thấy đề thi" 
//             });
//         }

//         const exam = examResult[0];

//         db.query(sqlQuestions, [examId], (err2, questions) => {
//             if (err2) {
//                 console.error("❌ Questions error:", err2);
//                 return res.status(500).json({ 
//                     message: "Lỗi khi lấy câu hỏi", 
//                     error: err2.message 
//                 });
//             }

//             db.query(sqlAnswers, [examId], (err3, answers) => {
//                 if (err3) {
//                     console.error("❌ Answers error:", err3);
//                     return res.status(500).json({ 
//                         message: "Lỗi khi lấy đáp án", 
//                         error: err3.message 
//                     });
//                 }

//                 const questionsWithAnswers = questions.map(q => ({
//                     ...q,
//                     answers: answers.filter(a => a.question_id === q.id)
//                 }));

//                 console.log(`✅ Trả về đầy đủ đề thi ID: ${examId}`);
//                 res.json({
//                     exam: exam,
//                     questions: questionsWithAnswers,
//                     totalQuestions: questions.length,
//                     totalAnswers: answers.length
//                 });
//             });
//         });
//     });
// });

// // ========================
// // ✏️ PUT: Cập nhật câu hỏi và đáp án (Teacher & Admin only)
// // ========================
// app.put("/api/exams/:id/questions", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
//     const examId = req.params.id;
//     const { questions } = req.body;

//     console.log(`✏️ PUT /api/exams/${examId}/questions - Updating ${questions?.length || 0} questions`);

//     if (!questions || !Array.isArray(questions)) {
//         return res.status(400).json({ message: "Dữ liệu câu hỏi không hợp lệ" });
//     }

//     try {
//         // 1. Xóa tất cả câu hỏi cũ (CASCADE sẽ xóa answers)
//         await new Promise((resolve, reject) => {
//             db.query("DELETE FROM questions WHERE exam_id = ?", [examId], (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         console.log(`🗑️ Đã xóa câu hỏi cũ của exam ${examId}`);

//         // 2. Insert câu hỏi và đáp án mới
//         for (let i = 0; i < questions.length; i++) {
//             const q = questions[i];
            
//             // Insert question
//             const questionId = await new Promise((resolve, reject) => {
//                 const sql = "INSERT INTO questions (exam_id, question_text, order_index) VALUES (?, ?, ?)";
//                 db.query(sql, [examId, q.question_text, i], (err, result) => {
//                     if (err) reject(err);
//                     else resolve(result.insertId);
//                 });
//             });

//             console.log(`✅ Inserted question ${i + 1}/${questions.length}, ID: ${questionId}`);

//             // Insert answers
//             if (q.answers && q.answers.length > 0) {
//                 for (let j = 0; j < q.answers.length; j++) {
//                     const a = q.answers[j];
//                     await new Promise((resolve, reject) => {
//                         const sql = "INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)";
//                         db.query(sql, [questionId, a.answer_text, a.is_correct ? 1 : 0, j], (err) => {
//                             if (err) reject(err);
//                             else resolve();
//                         });
//                     });
//                 }
//                 console.log(`   ✅ Inserted ${q.answers.length} answers for question ${questionId}`);
//             }
//         }

//         console.log(`✅ Hoàn thành cập nhật ${questions.length} câu hỏi cho đề thi ID: ${examId}`);
//         res.json({
//             message: "Cập nhật câu hỏi thành công!",
//             examId,
//             totalQuestions: questions.length
//         });

//     } catch (err) {
//         console.error("❌ Update questions error:", err);
//         res.status(500).json({
//             message: "Lỗi khi cập nhật câu hỏi",
//             error: err.message
//         });
//     }
// });

// // ========================
// // 🗑️ DELETE: Xóa câu hỏi (Teacher & Admin only)
// // ========================
// app.delete("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const questionId = req.params.id;
//     console.log(`🗑️ DELETE /api/questions/${questionId}`);

//     const sqlCheck = `SELECT id, question_text FROM questions WHERE id = ?`;
    
//     db.query(sqlCheck, [questionId], (err, result) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ 
//                 message: "Không tìm thấy câu hỏi" 
//             });
//         }

//         const sqlDelete = `DELETE FROM questions WHERE id = ?`;
        
//         db.query(sqlDelete, [questionId], (err2) => {
//             if (err2) {
//                 return res.status(500).json({ 
//                     message: "Lỗi khi xóa câu hỏi", 
//                     error: err2.message 
//                 });
//             }

//             console.log(`✅ Đã xóa câu hỏi ID: ${questionId}`);
//             res.json({ 
//                 message: "Đã xóa câu hỏi thành công",
//                 questionId: questionId
//             });
//         });
//     });
// });

// // ========================
// // ✏️ PUT: Cập nhật câu hỏi (Teacher & Admin only)
// // ========================
// app.put("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const questionId = req.params.id;
//     const { question_text, points } = req.body;
//     console.log(`✏️ PUT /api/questions/${questionId}`);

//     if (!question_text) {
//         return res.status(400).json({ 
//             message: "Nội dung câu hỏi không được để trống" 
//         });
//     }

//     const sqlUpdate = `
//         UPDATE questions 
//         SET question_text = ?, points = ?
//         WHERE id = ?
//     `;

//     db.query(sqlUpdate, [question_text, points || 1, questionId], (err) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi khi cập nhật câu hỏi", 
//                 error: err.message 
//             });
//         }

//         console.log(`✅ Đã cập nhật câu hỏi ID: ${questionId}`);
//         res.json({ 
//             message: "Cập nhật câu hỏi thành công",
//             questionId: questionId
//         });
//     });
// });

// // ========================
// // 📝 POST: Thêm câu hỏi mới (Teacher & Admin only)
// // ========================
// app.post("/api/questions", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const { exam_id, question_text, points, answers } = req.body;
//     console.log(`📝 POST /api/questions`);

//     if (!exam_id || !question_text) {
//         return res.status(400).json({ 
//             message: "Thiếu exam_id hoặc question_text" 
//         });
//     }

//     const sqlMaxOrder = `SELECT MAX(order_index) as max_order FROM questions WHERE exam_id = ?`;
    
//     db.query(sqlMaxOrder, [exam_id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         const nextOrder = (result[0].max_order || -1) + 1;

//         const sqlInsert = `
//             INSERT INTO questions (exam_id, question_text, points, order_index)
//             VALUES (?, ?, ?, ?)
//         `;

//         db.query(sqlInsert, [exam_id, question_text, points || 1, nextOrder], (err2, result2) => {
//             if (err2) {
//                 return res.status(500).json({ 
//                     message: "Lỗi khi thêm câu hỏi", 
//                     error: err2.message 
//                 });
//             }

//             const questionId = result2.insertId;

//             if (answers && answers.length > 0) {
//                 answers.forEach((answer, index) => {
//                     const sqlAnswer = `
//                         INSERT INTO answers (question_id, answer_text, is_correct, order_index)
//                         VALUES (?, ?, ?, ?)
//                     `;
//                     db.query(sqlAnswer, [
//                         questionId,
//                         answer.text,
//                         answer.is_correct || false,
//                         index
//                     ]);
//                 });
//             }

//             console.log(`✅ Đã thêm câu hỏi mới ID: ${questionId}`);
//             res.status(201).json({ 
//                 message: "Thêm câu hỏi thành công",
//                 questionId: questionId
//             });
//         });
//     });
// });

// // ========================
// // 🗑️ DELETE: Xóa đáp án (Teacher & Admin only)
// // ========================
// app.delete("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const answerId = req.params.id;
//     console.log(`🗑️ DELETE /api/answers/${answerId}`);

//     const sqlDelete = `DELETE FROM answers WHERE id = ?`;
    
//     db.query(sqlDelete, [answerId], (err, result) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi khi xóa đáp án", 
//                 error: err.message 
//             });
//         }

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ 
//                 message: "Không tìm thấy đáp án" 
//             });
//         }

//         console.log(`✅ Đã xóa đáp án ID: ${answerId}`);
//         res.json({ 
//             message: "Đã xóa đáp án thành công",
//             answerId: answerId
//         });
//     });
// });

// // ========================
// // ✏️ PUT: Cập nhật đáp án (Teacher & Admin only)
// // ========================
// app.put("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const answerId = req.params.id;
//     const { answer_text, is_correct } = req.body;
//     console.log(`✏️ PUT /api/answers/${answerId}`);

//     if (!answer_text) {
//         return res.status(400).json({ 
//             message: "Nội dung đáp án không được để trống" 
//         });
//     }

//     const sqlUpdate = `
//         UPDATE answers 
//         SET answer_text = ?, is_correct = ?
//         WHERE id = ?
//     `;

//     db.query(sqlUpdate, [answer_text, is_correct || false, answerId], (err) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi khi cập nhật đáp án", 
//                 error: err.message 
//             });
//         }

//         console.log(`✅ Đã cập nhật đáp án ID: ${answerId}`);
//         res.json({ 
//             message: "Cập nhật đáp án thành công",
//             answerId: answerId
//         });
//     });
// });

// // ========================
// // 📝 POST: Thêm đáp án mới (Teacher & Admin only)
// // ========================
// app.post("/api/answers", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
//     const { question_id, answer_text, is_correct } = req.body;
//     console.log(`📝 POST /api/answers`);

//     if (!question_id || !answer_text) {
//         return res.status(400).json({ 
//             message: "Thiếu question_id hoặc answer_text" 
//         });
//     }

//     const sqlMaxOrder = `SELECT MAX(order_index) as max_order FROM answers WHERE question_id = ?`;
    
//     db.query(sqlMaxOrder, [question_id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ 
//                 message: "Lỗi server", 
//                 error: err.message 
//             });
//         }

//         const nextOrder = (result[0].max_order || -1) + 1;

//         const sqlInsert = `
//             INSERT INTO answers (question_id, answer_text, is_correct, order_index)
//             VALUES (?, ?, ?, ?)
//         `;

//         db.query(sqlInsert, [question_id, answer_text, is_correct || false, nextOrder], (err2, result2) => {
//             if (err2) {
//                 return res.status(500).json({ 
//                     message: "Lỗi khi thêm đáp án", 
//                     error: err2.message 
//                 });
//             }

//             console.log(`✅ Đã thêm đáp án mới ID: ${result2.insertId}`);
//             res.status(201).json({ 
//                 message: "Thêm đáp án thành công",
//                 answerId: result2.insertId
//             });
//         });
//     });
// });

// app.get("/", (req, res) => {
//     res.json({ 
//         message: "Backend API is running!",
//         status: "ok",
//         timestamp: new Date().toISOString()
//     });
// });

// // ========================
// // ❌ 404 Handler
// // ========================
// app.use((req, res) => {
//     console.log(`❌ 404 - ${req.method} ${req.url}`);
//     res.status(404).json({ message: "Route không tồn tại" });
// });

// // ========================
// // 🚀 START SERVER
// // ========================
// // const PORT = 5000;

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running at http://localhost:${PORT}`);
//     console.log(`\n🔐 Authentication endpoints:`);
//     console.log(`   POST /api/auth/register (Public)`);
//     console.log(`   POST /api/auth/login (Public)`);
//     console.log(`   GET  /api/auth/verify (Authenticated)`);
//     console.log(`   GET  /api/auth/profile (Authenticated)`);
//     console.log(`   PUT  /api/auth/profile (Authenticated)`);
//     console.log(`   PUT  /api/auth/change-password (Authenticated)`);
//     console.log(`\n📡 Anti-cheat endpoints:`);
//     console.log(`   POST /api/exam-session/start (Student)`);
//     console.log(`   POST /api/exam-session/heartbeat (Student)`);
//     console.log(`   POST /api/exam-session/violation (Student)`);
//     console.log(`   POST /api/exam-session/submit (Student)`);
//     console.log(`   GET  /api/exam-session/result/:sessionId (Authenticated)`);
//     console.log(`   GET  /api/exam-session/results/user/:userId (Authenticated)`);
//     console.log(`\n📝 Exam management endpoints:`);
//     console.log(`   POST   /api/exams (Teacher/Admin)`);
//     console.log(`   GET    /api/exams (Authenticated)`);
//     console.log(`   GET    /api/exams/:id (Authenticated)`);
//     console.log(`   DELETE /api/exams/:id (Teacher/Admin)`);
//     console.log(`   PUT    /api/exams/:id (Teacher/Admin)`);
//     console.log(`   GET    /api/exams/:id/full (Teacher/Admin)`);
//     console.log(`   PUT    /api/exams/:id/questions (Teacher/Admin)`);
//     console.log(`\n📝 Questions & Answers endpoints:`);
//     console.log(`   POST   /api/questions (Teacher/Admin)`);
//     console.log(`   PUT    /api/questions/:id (Teacher/Admin)`);
//     console.log(`   DELETE /api/questions/:id (Teacher/Admin)`);
//     console.log(`   POST   /api/answers (Teacher/Admin)`);
//     console.log(`   PUT    /api/answers/:id (Teacher/Admin)`);
//     console.log(`   DELETE /api/answers/:id (Teacher/Admin)`);
// });



import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import db from "./db.js";
import authRoutes from "./routes/auth.js";
import examSessionRoutes from "./routes/exam-session.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import { verifyRole } from "./middlewares/roleMiddleware.js";

const app = express();

// ========================
// 🛡️ SECURITY HEADERS
// ========================
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Tắt CSP để tránh conflict với frontend
}));

// ========================
// 🌐 CORS (FIX CHO VERCEL + RENDER)
// ========================
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-app.vercel.app", // Thay bằng domain Vercel thật
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`⚠️ Blocked CORS from: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// ========================
// 🚫 RATE LIMITING (Chống spam)
// ========================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // 100 requests per IP
    message: { 
        success: false,
        message: "Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút" 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit nghiêm ngặt hơn cho auth endpoints
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 9000000, // Chỉ 20 requests/15 phút
    message: { 
        success: false,
        message: "Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau" 
    },
});

// Apply to all routes
app.use(limiter);

// ========================
// 📦 BODY PARSER (với giới hạn size)
// ========================
app.use(express.json({ limit: "10mb" })); // Giới hạn 10MB cho JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ========================
// 📜 REQUEST LOGGING (chỉ trong development)
// ========================
if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.url}`);
        if (Object.keys(req.body).length > 0) {
            console.log("Body:", req.body);
        }
        next();
    });
}

// ========================
// ❤️ HEALTH CHECK (cho Render)
// ========================
app.get("/health", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            return res.status(503).json({ 
                status: "error",
                message: "Database not connected",
                timestamp: new Date().toISOString()
            });
        }
        res.json({ 
            status: "ok",
            message: "Server is running",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    });
});

// ========================
// 🧪 TEST ENDPOINT
// ========================
app.get("/api/test", (req, res) => {
    res.json({ 
        success: true,
        message: "Backend hoạt động!", 
        time: new Date().toISOString(),
        env: process.env.NODE_ENV || "development"
    });
});

// ========================
// 🔐 AUTH ROUTES (với rate limiting)
// ========================
app.use("/api/auth", authLimiter, authRoutes);

// ========================
// 🎓 EXAM SESSION ROUTES
// ========================
app.use("/api/exam-session", examSessionRoutes);

// ========================
// 📝 QUESTIONS CRUD ROUTES
// ========================

// POST: Thêm câu hỏi mới
app.post("/api/questions", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const { exam_id, question_text, points, answers } = req.body;

        if (!exam_id || !question_text) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu exam_id hoặc question_text" 
            });
        }

        const [result] = await db.promise().query(
            "INSERT INTO questions (exam_id, question_text, points, order_index) VALUES (?, ?, ?, ?)",
            [exam_id, question_text, points || 1, 0]
        );

        res.status(201).json({
            success: true,
            message: "Thêm câu hỏi thành công!",
            questionId: result.insertId
        });

    } catch (err) {
        console.error("❌ Add question error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi thêm câu hỏi: " + err.message 
        });
    }
});

// PUT: Cập nhật câu hỏi
app.put("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const questionId = req.params.id;
        const { question_text } = req.body;

        if (!question_text) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu question_text" 
            });
        }

        const [result] = await db.promise().query(
            "UPDATE questions SET question_text = ? WHERE id = ?",
            [question_text, questionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy câu hỏi" 
            });
        }

        res.json({
            success: true,
            message: "Cập nhật câu hỏi thành công!"
        });

    } catch (err) {
        console.error("❌ Update question error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi cập nhật câu hỏi: " + err.message 
        });
    }
});

// DELETE: Xóa câu hỏi
app.delete("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const questionId = req.params.id;

        const [result] = await db.promise().query(
            "DELETE FROM questions WHERE id = ?",
            [questionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy câu hỏi" 
            });
        }

        res.json({
            success: true,
            message: "Xóa câu hỏi thành công!"
        });

    } catch (err) {
        console.error("❌ Delete question error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi xóa câu hỏi: " + err.message 
        });
    }
});

// ========================
// 📝 ANSWERS CRUD ROUTES
// ========================

// POST: Thêm đáp án mới
app.post("/api/answers", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const { question_id, answer_text, is_correct } = req.body;

        if (!question_id || !answer_text) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu question_id hoặc answer_text" 
            });
        }

        const [result] = await db.promise().query(
            "INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
            [question_id, answer_text, is_correct ? 1 : 0, 0]
        );

        res.status(201).json({
            success: true,
            message: "Thêm đáp án thành công!",
            answerId: result.insertId
        });

    } catch (err) {
        console.error("❌ Add answer error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi thêm đáp án: " + err.message 
        });
    }
});

// PUT: Cập nhật đáp án
app.put("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const answerId = req.params.id;
        const { answer_text, is_correct } = req.body;

        if (!answer_text) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu answer_text" 
            });
        }

        const [result] = await db.promise().query(
            "UPDATE answers SET answer_text = ?, is_correct = ? WHERE id = ?",
            [answer_text, is_correct ? 1 : 0, answerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đáp án" 
            });
        }

        res.json({
            success: true,
            message: "Cập nhật đáp án thành công!"
        });

    } catch (err) {
        console.error("❌ Update answer error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi cập nhật đáp án: " + err.message 
        });
    }
});

// DELETE: Xóa đáp án
app.delete("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const answerId = req.params.id;

        const [result] = await db.promise().query(
            "DELETE FROM answers WHERE id = ?",
            [answerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đáp án" 
            });
        }

        res.json({
            success: true,
            message: "Xóa đáp án thành công!"
        });

    } catch (err) {
        console.error("❌ Delete answer error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi xóa đáp án: " + err.message 
        });
    }
});

// ========================
// 📝 EXAM CRUD ROUTES
// ========================

// POST: Tạo đề thi (Teacher & Admin)
app.post("/api/exams", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const { title, duration, parts, questions, tags, description } = req.body;

        if (!title || !questions) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu title hoặc questions" 
            });
        }

        if (duration <= 0) {
            return res.status(400).json({ 
                success: false,
                message: "Thời gian thi phải lớn hơn 0" 
            });
        }

        // Parse questions
        let parsedQuestions;
        try {
            parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
        } catch (e) {
            return res.status(400).json({ 
                success: false,
                message: "Format câu hỏi không hợp lệ" 
            });
        }

        // Insert exam
        const [examResult] = await db.promise().query(
            "INSERT INTO exams (title, description, duration, parts, tags) VALUES (?, ?, ?, ?, ?)",
            [title, description || null, duration, parts || 1, tags || null]
        );

        const examId = examResult.insertId;
        console.log(`✅ Exam created: ${examId}`);

        // Insert questions and answers
        for (let i = 0; i < parsedQuestions.length; i++) {
            const q = parsedQuestions[i];
            
            const [questionResult] = await db.promise().query(
                "INSERT INTO questions (exam_id, question_text, order_index) VALUES (?, ?, ?)",
                [examId, q.text || q.question_text, i]
            );

            const questionId = questionResult.insertId;

            if (q.answers && q.answers.length > 0) {
                for (let j = 0; j < q.answers.length; j++) {
                    const a = q.answers[j];
                    await db.promise().query(
                        "INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
                        [questionId, a.text || a.answer_text, a.isCorrect || a.is_correct || false, j]
                    );
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Tạo đề thi thành công!",
            examId,
            title,
            totalQuestions: parsedQuestions.length
        });

    } catch (err) {
        console.error("❌ Create exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi tạo đề thi: " + err.message 
        });
    }
});

// GET: Danh sách đề thi
app.get("/api/exams", verifyToken, async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT 
                e.id,
                e.title,
                e.description,
                e.duration,
                e.parts,
                e.tags,
                e.created_at,
                COUNT(DISTINCT q.id) AS questions
            FROM exams e
            LEFT JOIN questions q ON e.id = q.exam_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `);

        res.json({
            success: true,
            total: results.length,
            data: results
        });

    } catch (err) {
        console.error("❌ Get exams error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy danh sách đề thi" 
        });
    }
});

// GET: Chi tiết 1 đề thi
app.get("/api/exams/:id", verifyToken, async (req, res) => {
    try {
        const examId = req.params.id;

        const [exam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [examId]);
        
        if (exam.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đề thi" 
            });
        }

        const [questions] = await db.promise().query(
            "SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index",
            [examId]
        );

        const [answers] = await db.promise().query(
            `SELECT a.* FROM answers a
             INNER JOIN questions q ON a.question_id = q.id
             WHERE q.exam_id = ?
             ORDER BY q.order_index, a.order_index`,
            [examId]
        );

        res.json({
            success: true,
            exam: exam[0],
            questions,
            answers
        });

    } catch (err) {
        console.error("❌ Get exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy chi tiết đề thi" 
        });
    }
});

// DELETE: Xóa đề thi
app.delete("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const examId = req.params.id;

        const [exam] = await db.promise().query("SELECT title FROM exams WHERE id = ?", [examId]);
        
        if (exam.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đề thi" 
            });
        }

        await db.promise().query("DELETE FROM exams WHERE id = ?", [examId]);

        console.log(`✅ Deleted exam: ${exam[0].title}`);
        res.json({ 
            success: true,
            message: `Đã xóa đề thi: ${exam[0].title}`,
            examId
        });

    } catch (err) {
        console.error("❌ Delete exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi xóa đề thi" 
        });
    }
});

// PUT: Cập nhật thông tin đề thi
app.put("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const examId = req.params.id;
        const { title, description, duration, parts, tags } = req.body;

        if (!title || !duration || duration <= 0) {
            return res.status(400).json({ 
                success: false,
                message: "Dữ liệu không hợp lệ" 
            });
        }

        const [result] = await db.promise().query(
            `UPDATE exams 
             SET title = ?, description = ?, duration = ?, parts = ?, tags = ?
             WHERE id = ?`,
            [title, description || null, duration, parts || 1, tags || null, examId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đề thi" 
            });
        }

        console.log(`✅ Updated exam: ${examId}`);
        res.json({ 
            success: true,
            message: "Cập nhật đề thi thành công",
            examId
        });

    } catch (err) {
        console.error("❌ Update exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi cập nhật đề thi" 
        });
    }
});

// GET: Chi tiết đầy đủ để edit
app.get("/api/exams/:id/full", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const examId = req.params.id;

        const [exam] = await db.promise().query("SELECT * FROM exams WHERE id = ?", [examId]);
        
        if (exam.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy đề thi" 
            });
        }

        const [questions] = await db.promise().query(
            "SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index",
            [examId]
        );

        const [answers] = await db.promise().query(
            `SELECT a.* FROM answers a
             INNER JOIN questions q ON a.question_id = q.id
             WHERE q.exam_id = ?
             ORDER BY q.order_index, a.order_index`,
            [examId]
        );

        // Group answers by question
        const questionsWithAnswers = questions.map(q => ({
            ...q,
            answers: answers.filter(a => a.question_id === q.id)
        }));

        res.json({
            success: true,
            exam: exam[0],
            questions: questionsWithAnswers
        });

    } catch (err) {
        console.error("❌ Get full exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi lấy chi tiết đề thi" 
        });
    }
});

// PUT: Cập nhật câu hỏi
app.put("/api/exams/:id/questions", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    try {
        const examId = req.params.id;
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ 
                success: false,
                message: "Dữ liệu câu hỏi không hợp lệ" 
            });
        }

        // Start transaction
        await db.promise().query("START TRANSACTION");

        try {
            // Delete old questions (CASCADE will delete answers)
            await db.promise().query("DELETE FROM questions WHERE exam_id = ?", [examId]);

            // Insert new questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                
                const [result] = await db.promise().query(
                    "INSERT INTO questions (exam_id, question_text, order_index) VALUES (?, ?, ?)",
                    [examId, q.question_text, i]
                );

                const questionId = result.insertId;

                // Insert answers
                if (q.answers && q.answers.length > 0) {
                    for (let j = 0; j < q.answers.length; j++) {
                        const a = q.answers[j];
                        await db.promise().query(
                            "INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)",
                            [questionId, a.answer_text, a.is_correct ? 1 : 0, j]
                        );
                    }
                }
            }

            await db.promise().query("COMMIT");

            console.log(`✅ Updated ${questions.length} questions for exam ${examId}`);
            res.json({
                success: true,
                message: "Cập nhật câu hỏi thành công",
                totalQuestions: questions.length
            });

        } catch (err) {
            await db.promise().query("ROLLBACK");
            throw err;
        }

    } catch (err) {
        console.error("❌ Update questions error:", err);
        res.status(500).json({ 
            success: false,
            message: "Lỗi khi cập nhật câu hỏi: " + err.message 
        });
    }
});

// ========================
// 🏠 ROOT ENDPOINT
// ========================
app.get("/", (req, res) => {
    res.json({ 
        success: true,
        message: "Quiz App Backend API",
        version: "1.0.0",
        status: "running",
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "/health",
            auth: "/api/auth/*",
            exams: "/api/exams/*",
            sessions: "/api/exam-session/*"
        }
    });
});

// ========================
// ❌ 404 HANDLER
// ========================
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route không tồn tại: ${req.method} ${req.url}` 
    });
});

// ========================
// ⚠️ ERROR HANDLER (Global)
// ========================
app.use((err, req, res, next) => {
    console.error("❌ Global error:", err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Lỗi server",
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
});

// ========================
// 🚀 START SERVER
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          🚀 QUIZ APP BACKEND SERVER STARTED               ║
╠════════════════════════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}
║  Port:        ${PORT}
║  Time:        ${new Date().toISOString()}
╚════════════════════════════════════════════════════════════╝

📍 Endpoints:
   ❤️  Health Check:     GET  /health
   🧪 Test:             GET  /api/test
   
🔐 Authentication:
   POST /api/auth/register
   POST /api/auth/login
   GET  /api/auth/verify
   GET  /api/auth/profile
   PUT  /api/auth/profile
   PUT  /api/auth/change-password
   
🎓 Exam Sessions (Anti-cheat):
   POST /api/exam-session/start
   POST /api/exam-session/heartbeat
   POST /api/exam-session/violation
   POST /api/exam-session/submit
   GET  /api/exam-session/result/:sessionId
   GET  /api/exam-session/results/user/:userId
   GET  /api/exam-session/active
   POST /api/exam-session/cleanup
   
📝 Exam Management:
   POST   /api/exams
   GET    /api/exams
   GET    /api/exams/:id
   DELETE /api/exams/:id
   PUT    /api/exams/:id
   GET    /api/exams/:id/full
   PUT    /api/exams/:id/questions

Ready to handle requests! 🎉
    `);
});