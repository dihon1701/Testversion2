import express from "express";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/auth.js";
import examSessionRoutes from "./routes/exam-session.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import { verifyRole } from "./middlewares/roleMiddleware.js";

const app = express();

// ========================
// 🌐 CORS
// ========================
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.use(express.json());

// ========================
// 📜 Log mọi request
// ========================
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    console.log("Body:", req.body);
    next();
});

// ========================
// 🧪 Test endpoint
// ========================
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend hoạt động!", time: new Date().toISOString() });
});

// ========================
// 🔐 Routes (Public - không cần đăng nhập)
// ========================
app.use("/api/auth", authRoutes);

// ========================
// 🎓 Exam Session Routes (Student only)
// ========================
app.use("/api/exam-session", examSessionRoutes);

// ========================
// 📝 POST: Lưu đề thi (Teacher & Admin only)
// ========================
app.post("/api/exams", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    console.log("🎯 POST /api/exams");

    const { title, duration, parts, questions, tags, description } = req.body;

    if (!title || !questions) {
        return res.status(400).json({ message: "Thiếu title hoặc questions" });
    }

    const sqlExam = `
        INSERT INTO exams (title, description, duration, parts, tags) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sqlExam,
        [title, description || null, duration, parts, tags || null],
        (err, result) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res
                    .status(500)
                    .json({ message: "Lỗi server", error: err.message });
            }

            const examId = result.insertId;
            console.log("✅ Exam inserted, ID:", examId);

            let parsedQuestions;
            try {
                parsedQuestions = JSON.parse(questions);
            } catch (e) {
                return res
                    .status(400)
                    .json({ message: "questions không phải JSON hợp lệ" });
            }

            if (parsedQuestions.length === 0) {
                return res.status(201).json({
                    message: "Lưu thành công (không có câu hỏi)",
                    examId,
                    title,
                });
            }

            // Insert từng câu hỏi và đáp án
            parsedQuestions.forEach((q, index) => {
                const sqlQuestion = `
                    INSERT INTO questions (exam_id, question_text, order_index)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    sqlQuestion,
                    [examId, q.text, index],
                    (err2, result2) => {
                        if (err2) {
                            console.error("❌ Insert question error:", err2);
                            return;
                        }

                        const questionId = result2.insertId;

                        if (q.answers && q.answers.length > 0) {
                            q.answers.forEach((a, aIndex) => {
                                const sqlAnswer = `
                                    INSERT INTO answers (question_id, answer_text, is_correct, order_index)
                                    VALUES (?, ?, ?, ?)
                                `;
                                db.query(
                                    sqlAnswer,
                                    [
                                        questionId,
                                        a.text,
                                        a.isCorrect || false,
                                        aIndex,
                                    ],
                                    (err3) => {
                                        if (err3)
                                            console.error(
                                                "❌ Insert answer error:",
                                                err3
                                            );
                                    }
                                );
                            });
                        }
                    }
                );
            });

            res.status(201).json({
                message: "Lưu đề thành công!",
                examId,
                title,
                totalQuestions: parsedQuestions.length,
            });
        }
    );
});

// ========================
// 📋 GET: Lấy danh sách đề thi (Tất cả user đã đăng nhập)
// ========================
app.get("/api/exams", verifyToken, (req, res) => {
    console.log("📋 GET /api/exams");

    const sql = `
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
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res
                .status(500)
                .json({ message: "Lỗi server", error: err.message });
        }

        console.log(`✅ Found ${results.length} exams`);

        res.json({
            message: "Lấy danh sách thành công",
            total: results.length,
            data: results,
        });
    });
});

// ========================
// 📌 GET: Lấy 1 đề theo ID (Tất cả user đã đăng nhập)
// ========================
app.get("/api/exams/:id", verifyToken, (req, res) => {
    const examId = req.params.id;
    console.log(`🔍 GET /api/exams/${examId}`);

    const sqlExam = `SELECT * FROM exams WHERE id = ?`;
    const sqlQuestions = `SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index`;
    const sqlAnswers = `SELECT * FROM answers WHERE question_id IN (SELECT id FROM questions WHERE exam_id = ?) ORDER BY order_index`;

    db.query(sqlExam, [examId], (err, exam) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", error: err.message });

        if (exam.length === 0) {
            console.log("❌ Không tìm thấy đề thi ID:", examId);
            return res.status(404).json({ message: "Không tìm thấy đề thi" });
        }

        db.query(sqlQuestions, [examId], (err2, questions) => {
            if (err2) return res.status(500).json({ error: err2.message });

            db.query(sqlAnswers, [examId], (err3, answers) => {
                if (err3) return res.status(500).json({ error: err3.message });

                console.log("✅ Trả về đầy đủ đề thi");
                res.json({
                    exam: exam[0],
                    questions: questions,
                    answers: answers
                });
            });
        });
    });
});

// ========================
// 🗑️ DELETE: Xóa đề thi (Teacher & Admin only)
// ========================
app.delete("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const examId = req.params.id;
    console.log(`🗑️ DELETE /api/exams/${examId}`);

    const sqlCheck = `SELECT id, title FROM exams WHERE id = ?`;
    
    db.query(sqlCheck, [examId], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        if (result.length === 0) {
            console.log("❌ Không tìm thấy đề thi ID:", examId);
            return res.status(404).json({ 
                message: "Không tìm thấy đề thi" 
            });
        }

        const examTitle = result[0].title;
        const sqlDelete = `DELETE FROM exams WHERE id = ?`;
        
        db.query(sqlDelete, [examId], (err2, deleteResult) => {
            if (err2) {
                console.error("❌ Delete error:", err2);
                return res.status(500).json({ 
                    message: "Lỗi khi xóa đề thi", 
                    error: err2.message 
                });
            }

            console.log(`✅ Đã xóa đề thi: ${examTitle}`);
            res.json({ 
                message: `Đã xóa thành công đề thi: ${examTitle}`,
                examId: examId,
                examTitle: examTitle
            });
        });
    });
});

// ========================
// ✏️ PUT: Cập nhật đề thi (Teacher & Admin only)
// ========================
app.put("/api/exams/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const examId = req.params.id;
    console.log(`✏️ PUT /api/exams/${examId}`);

    const { title, description, duration, parts, tags } = req.body;

    if (!title || !duration) {
        return res.status(400).json({ 
            message: "Thiếu thông tin: title và duration là bắt buộc" 
        });
    }

    if (duration <= 0) {
        return res.status(400).json({ 
            message: "Thời gian thi phải lớn hơn 0" 
        });
    }

    const sqlCheck = `SELECT id FROM exams WHERE id = ?`;
    
    db.query(sqlCheck, [examId], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        if (result.length === 0) {
            console.log("❌ Không tìm thấy đề thi ID:", examId);
            return res.status(404).json({ 
                message: "Không tìm thấy đề thi" 
            });
        }

        const sqlUpdate = `
            UPDATE exams 
            SET title = ?, 
                description = ?, 
                duration = ?, 
                parts = ?, 
                tags = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.query(
            sqlUpdate,
            [title, description || null, duration, parts || 1, tags || null, examId],
            (err2, updateResult) => {
                if (err2) {
                    console.error("❌ Update error:", err2);
                    return res.status(500).json({ 
                        message: "Lỗi khi cập nhật đề thi", 
                        error: err2.message 
                    });
                }

                console.log(`✅ Đã cập nhật đề thi ID: ${examId}`);
                res.json({ 
                    message: "Cập nhật đề thi thành công!",
                    examId: examId,
                    title: title,
                    updatedFields: { title, description, duration, parts, tags }
                });
            }
        );
    });
});

// ========================
// 📖 GET: Lấy chi tiết đề thi để chỉnh sửa (Teacher & Admin only)
// ========================
app.get("/api/exams/:id/full", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const examId = req.params.id;
    console.log(`📖 GET /api/exams/${examId}/full`);

    const sqlExam = `SELECT * FROM exams WHERE id = ?`;
    const sqlQuestions = `SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index`;
    const sqlAnswers = `
        SELECT a.* 
        FROM answers a
        INNER JOIN questions q ON a.question_id = q.id
        WHERE q.exam_id = ?
        ORDER BY q.order_index, a.order_index
    `;

    db.query(sqlExam, [examId], (err, examResult) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        if (examResult.length === 0) {
            console.log("❌ Không tìm thấy đề thi ID:", examId);
            return res.status(404).json({ 
                message: "Không tìm thấy đề thi" 
            });
        }

        const exam = examResult[0];

        db.query(sqlQuestions, [examId], (err2, questions) => {
            if (err2) {
                console.error("❌ Questions error:", err2);
                return res.status(500).json({ 
                    message: "Lỗi khi lấy câu hỏi", 
                    error: err2.message 
                });
            }

            db.query(sqlAnswers, [examId], (err3, answers) => {
                if (err3) {
                    console.error("❌ Answers error:", err3);
                    return res.status(500).json({ 
                        message: "Lỗi khi lấy đáp án", 
                        error: err3.message 
                    });
                }

                const questionsWithAnswers = questions.map(q => ({
                    ...q,
                    answers: answers.filter(a => a.question_id === q.id)
                }));

                console.log(`✅ Trả về đầy đủ đề thi ID: ${examId}`);
                res.json({
                    exam: exam,
                    questions: questionsWithAnswers,
                    totalQuestions: questions.length,
                    totalAnswers: answers.length
                });
            });
        });
    });
});

// ========================
// ✏️ PUT: Cập nhật câu hỏi và đáp án (Teacher & Admin only)
// ========================
app.put("/api/exams/:id/questions", verifyToken, verifyRole("teacher", "admin"), async (req, res) => {
    const examId = req.params.id;
    const { questions } = req.body;

    console.log(`✏️ PUT /api/exams/${examId}/questions - Updating ${questions?.length || 0} questions`);

    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Dữ liệu câu hỏi không hợp lệ" });
    }

    try {
        // 1. Xóa tất cả câu hỏi cũ (CASCADE sẽ xóa answers)
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM questions WHERE exam_id = ?", [examId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`🗑️ Đã xóa câu hỏi cũ của exam ${examId}`);

        // 2. Insert câu hỏi và đáp án mới
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            
            // Insert question
            const questionId = await new Promise((resolve, reject) => {
                const sql = "INSERT INTO questions (exam_id, question_text, order_index) VALUES (?, ?, ?)";
                db.query(sql, [examId, q.question_text, i], (err, result) => {
                    if (err) reject(err);
                    else resolve(result.insertId);
                });
            });

            console.log(`✅ Inserted question ${i + 1}/${questions.length}, ID: ${questionId}`);

            // Insert answers
            if (q.answers && q.answers.length > 0) {
                for (let j = 0; j < q.answers.length; j++) {
                    const a = q.answers[j];
                    await new Promise((resolve, reject) => {
                        const sql = "INSERT INTO answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)";
                        db.query(sql, [questionId, a.answer_text, a.is_correct ? 1 : 0, j], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }
                console.log(`   ✅ Inserted ${q.answers.length} answers for question ${questionId}`);
            }
        }

        console.log(`✅ Hoàn thành cập nhật ${questions.length} câu hỏi cho đề thi ID: ${examId}`);
        res.json({
            message: "Cập nhật câu hỏi thành công!",
            examId,
            totalQuestions: questions.length
        });

    } catch (err) {
        console.error("❌ Update questions error:", err);
        res.status(500).json({
            message: "Lỗi khi cập nhật câu hỏi",
            error: err.message
        });
    }
});

// ========================
// 🗑️ DELETE: Xóa câu hỏi (Teacher & Admin only)
// ========================
app.delete("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const questionId = req.params.id;
    console.log(`🗑️ DELETE /api/questions/${questionId}`);

    const sqlCheck = `SELECT id, question_text FROM questions WHERE id = ?`;
    
    db.query(sqlCheck, [questionId], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        if (result.length === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy câu hỏi" 
            });
        }

        const sqlDelete = `DELETE FROM questions WHERE id = ?`;
        
        db.query(sqlDelete, [questionId], (err2) => {
            if (err2) {
                return res.status(500).json({ 
                    message: "Lỗi khi xóa câu hỏi", 
                    error: err2.message 
                });
            }

            console.log(`✅ Đã xóa câu hỏi ID: ${questionId}`);
            res.json({ 
                message: "Đã xóa câu hỏi thành công",
                questionId: questionId
            });
        });
    });
});

// ========================
// ✏️ PUT: Cập nhật câu hỏi (Teacher & Admin only)
// ========================
app.put("/api/questions/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const questionId = req.params.id;
    const { question_text, points } = req.body;
    console.log(`✏️ PUT /api/questions/${questionId}`);

    if (!question_text) {
        return res.status(400).json({ 
            message: "Nội dung câu hỏi không được để trống" 
        });
    }

    const sqlUpdate = `
        UPDATE questions 
        SET question_text = ?, points = ?
        WHERE id = ?
    `;

    db.query(sqlUpdate, [question_text, points || 1, questionId], (err) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi khi cập nhật câu hỏi", 
                error: err.message 
            });
        }

        console.log(`✅ Đã cập nhật câu hỏi ID: ${questionId}`);
        res.json({ 
            message: "Cập nhật câu hỏi thành công",
            questionId: questionId
        });
    });
});

// ========================
// 📝 POST: Thêm câu hỏi mới (Teacher & Admin only)
// ========================
app.post("/api/questions", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const { exam_id, question_text, points, answers } = req.body;
    console.log(`📝 POST /api/questions`);

    if (!exam_id || !question_text) {
        return res.status(400).json({ 
            message: "Thiếu exam_id hoặc question_text" 
        });
    }

    const sqlMaxOrder = `SELECT MAX(order_index) as max_order FROM questions WHERE exam_id = ?`;
    
    db.query(sqlMaxOrder, [exam_id], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        const nextOrder = (result[0].max_order || -1) + 1;

        const sqlInsert = `
            INSERT INTO questions (exam_id, question_text, points, order_index)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sqlInsert, [exam_id, question_text, points || 1, nextOrder], (err2, result2) => {
            if (err2) {
                return res.status(500).json({ 
                    message: "Lỗi khi thêm câu hỏi", 
                    error: err2.message 
                });
            }

            const questionId = result2.insertId;

            if (answers && answers.length > 0) {
                answers.forEach((answer, index) => {
                    const sqlAnswer = `
                        INSERT INTO answers (question_id, answer_text, is_correct, order_index)
                        VALUES (?, ?, ?, ?)
                    `;
                    db.query(sqlAnswer, [
                        questionId,
                        answer.text,
                        answer.is_correct || false,
                        index
                    ]);
                });
            }

            console.log(`✅ Đã thêm câu hỏi mới ID: ${questionId}`);
            res.status(201).json({ 
                message: "Thêm câu hỏi thành công",
                questionId: questionId
            });
        });
    });
});

// ========================
// 🗑️ DELETE: Xóa đáp án (Teacher & Admin only)
// ========================
app.delete("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const answerId = req.params.id;
    console.log(`🗑️ DELETE /api/answers/${answerId}`);

    const sqlDelete = `DELETE FROM answers WHERE id = ?`;
    
    db.query(sqlDelete, [answerId], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi khi xóa đáp án", 
                error: err.message 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: "Không tìm thấy đáp án" 
            });
        }

        console.log(`✅ Đã xóa đáp án ID: ${answerId}`);
        res.json({ 
            message: "Đã xóa đáp án thành công",
            answerId: answerId
        });
    });
});

// ========================
// ✏️ PUT: Cập nhật đáp án (Teacher & Admin only)
// ========================
app.put("/api/answers/:id", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const answerId = req.params.id;
    const { answer_text, is_correct } = req.body;
    console.log(`✏️ PUT /api/answers/${answerId}`);

    if (!answer_text) {
        return res.status(400).json({ 
            message: "Nội dung đáp án không được để trống" 
        });
    }

    const sqlUpdate = `
        UPDATE answers 
        SET answer_text = ?, is_correct = ?
        WHERE id = ?
    `;

    db.query(sqlUpdate, [answer_text, is_correct || false, answerId], (err) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi khi cập nhật đáp án", 
                error: err.message 
            });
        }

        console.log(`✅ Đã cập nhật đáp án ID: ${answerId}`);
        res.json({ 
            message: "Cập nhật đáp án thành công",
            answerId: answerId
        });
    });
});

// ========================
// 📝 POST: Thêm đáp án mới (Teacher & Admin only)
// ========================
app.post("/api/answers", verifyToken, verifyRole("teacher", "admin"), (req, res) => {
    const { question_id, answer_text, is_correct } = req.body;
    console.log(`📝 POST /api/answers`);

    if (!question_id || !answer_text) {
        return res.status(400).json({ 
            message: "Thiếu question_id hoặc answer_text" 
        });
    }

    const sqlMaxOrder = `SELECT MAX(order_index) as max_order FROM answers WHERE question_id = ?`;
    
    db.query(sqlMaxOrder, [question_id], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                message: "Lỗi server", 
                error: err.message 
            });
        }

        const nextOrder = (result[0].max_order || -1) + 1;

        const sqlInsert = `
            INSERT INTO answers (question_id, answer_text, is_correct, order_index)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sqlInsert, [question_id, answer_text, is_correct || false, nextOrder], (err2, result2) => {
            if (err2) {
                return res.status(500).json({ 
                    message: "Lỗi khi thêm đáp án", 
                    error: err2.message 
                });
            }

            console.log(`✅ Đã thêm đáp án mới ID: ${result2.insertId}`);
            res.status(201).json({ 
                message: "Thêm đáp án thành công",
                answerId: result2.insertId
            });
        });
    });
});

// ========================
// ❌ 404 Handler
// ========================
app.use((req, res) => {
    console.log(`❌ 404 - ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route không tồn tại" });
});

// ========================
// 🚀 START SERVER
// ========================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`\n🔐 Authentication endpoints:`);
    console.log(`   POST /api/auth/register (Public)`);
    console.log(`   POST /api/auth/login (Public)`);
    console.log(`   GET  /api/auth/verify (Authenticated)`);
    console.log(`   GET  /api/auth/profile (Authenticated)`);
    console.log(`   PUT  /api/auth/profile (Authenticated)`);
    console.log(`   PUT  /api/auth/change-password (Authenticated)`);
    console.log(`\n📡 Anti-cheat endpoints:`);
    console.log(`   POST /api/exam-session/start (Student)`);
    console.log(`   POST /api/exam-session/heartbeat (Student)`);
    console.log(`   POST /api/exam-session/violation (Student)`);
    console.log(`   POST /api/exam-session/submit (Student)`);
    console.log(`   GET  /api/exam-session/result/:sessionId (Authenticated)`);
    console.log(`   GET  /api/exam-session/results/user/:userId (Authenticated)`);
    console.log(`\n📝 Exam management endpoints:`);
    console.log(`   POST   /api/exams (Teacher/Admin)`);
    console.log(`   GET    /api/exams (Authenticated)`);
    console.log(`   GET    /api/exams/:id (Authenticated)`);
    console.log(`   DELETE /api/exams/:id (Teacher/Admin)`);
    console.log(`   PUT    /api/exams/:id (Teacher/Admin)`);
    console.log(`   GET    /api/exams/:id/full (Teacher/Admin)`);
    console.log(`   PUT    /api/exams/:id/questions (Teacher/Admin)`);
    console.log(`\n📝 Questions & Answers endpoints:`);
    console.log(`   POST   /api/questions (Teacher/Admin)`);
    console.log(`   PUT    /api/questions/:id (Teacher/Admin)`);
    console.log(`   DELETE /api/questions/:id (Teacher/Admin)`);
    console.log(`   POST   /api/answers (Teacher/Admin)`);
    console.log(`   PUT    /api/answers/:id (Teacher/Admin)`);
    console.log(`   DELETE /api/answers/:id (Teacher/Admin)`);
});