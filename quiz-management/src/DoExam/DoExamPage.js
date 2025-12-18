// //Sửa lần 2
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./DoExamPage.css";
// import useAuth from '../useAuth';

// const DoExamPage = ({
//   examId,
//   onLogout,
//   onNavigateHome,
//   onShowTeachers,
//   onShowStudents,
//   onShowExamBank,
//   onShowCreateExam,
// }) => {
//   // ✅ Lấy user từ AuthContext thay vì props
//   const { currentUser } = useAuth();
//   const userId = currentUser?.id;

//   // ========================
//   // STATES
//   // ========================
//   const [examInfo, setExamInfo] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(0);

//   // Anti-cheat states
//   const [sessionId, setSessionId] = useState(null);
//   const [sessionStarted, setSessionStarted] = useState(false);
//   const [violations, setViolations] = useState({ total: 0 });
//   const [settings, setSettings] = useState({
//     requireFullscreen: true,
//     maxViolations: 3,
//     blockCopy: true,
//     blockRightClick: true
//   });
//   const [kicked, setKicked] = useState(false);
//   const [fullscreenReady, setFullscreenReady] = useState(false);
//   const [error, setError] = useState(null);

//   // Refs
//   const fullscreenRef = useRef(null);
//   const heartbeatInterval = useRef(null);
//   const autoSaveInterval = useRef(null);

//   // ========================
//   // CONFIG
//   // ========================
//   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
//   const HEARTBEAT_INTERVAL = 15000; // 15 seconds
//   const AUTOSAVE_INTERVAL = 30000; // 30 seconds
//   const MAX_FULLSCREEN_RETRY = 3;

//   // ========================
//   // VALIDATION
//   // ========================
//   useEffect(() => {
//     if (!userId) {
//       setError("Vui lòng đăng nhập để thi!");
//       setTimeout(() => {
//         if (onLogout) onLogout();
//       }, 2000);
//     }
//   }, [userId, onLogout]);

//   // ========================
//   // 🔐 Get Device Info
//   // ========================
//   const getDeviceInfo = useCallback(() => {
//     return {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform,
//       language: navigator.language,
//       screenResolution: `${window.screen.width}x${window.screen.height}`,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       browser: (() => {
//         const ua = navigator.userAgent;
//         if (ua.includes('Chrome')) return 'Chrome';
//         if (ua.includes('Firefox')) return 'Firefox';
//         if (ua.includes('Safari')) return 'Safari';
//         if (ua.includes('Edge')) return 'Edge';
//         return 'Unknown';
//       })(),
//       os: navigator.platform.includes('Win') ? 'Windows' 
//         : navigator.platform.includes('Mac') ? 'macOS'
//         : navigator.platform.includes('Linux') ? 'Linux' : 'Unknown',
//       timestamp: new Date().toISOString()
//     };
//   }, []);

//   // ========================
//   // 💾 AUTO-SAVE ANSWERS TO LOCALSTORAGE
//   // ========================
//   const saveAnswersLocal = useCallback(() => {
//     if (!examId || !userId) return;
    
//     const key = `exam_${examId}_user_${userId}_answers`;
//     try {
//       localStorage.setItem(key, JSON.stringify({
//         answers,
//         timestamp: Date.now(),
//         timeLeft
//       }));
//     } catch (err) {
//       console.error("❌ Save answers error:", err);
//     }
//   }, [examId, userId, answers, timeLeft]);

//   // Load saved answers
//   const loadAnswersLocal = useCallback(() => {
//     if (!examId || !userId) return null;
    
//     const key = `exam_${examId}_user_${userId}_answers`;
//     try {
//       const saved = localStorage.getItem(key);
//       if (saved) {
//         const data = JSON.parse(saved);
//         // Check if saved within last 2 hours
//         if (Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
//           return data;
//         }
//       }
//     } catch (err) {
//       console.error("❌ Load answers error:", err);
//     }
//     return null;
//   }, [examId, userId]);

//   // Clear saved answers
//   const clearAnswersLocal = useCallback(() => {
//     if (!examId || !userId) return;
    
//     const key = `exam_${examId}_user_${userId}_answers`;
//     try {
//       localStorage.removeItem(key);
//     } catch (err) {
//       console.error("❌ Clear answers error:", err);
//     }
//   }, [examId, userId]);

//   // Auto-save interval
//   useEffect(() => {
//     if (!sessionStarted || submitted) return;

//     autoSaveInterval.current = setInterval(saveAnswersLocal, AUTOSAVE_INTERVAL);

//     return () => {
//       if (autoSaveInterval.current) {
//         clearInterval(autoSaveInterval.current);
//       }
//     };
//   }, [sessionStarted, submitted, saveAnswersLocal]);

//   // ========================
//   // 🚀 START SESSION
//   // ========================
//   const startSession = useCallback(async () => {
//     if (!userId || sessionStarted) return;

//     try {
//       const deviceInfo = getDeviceInfo();

//       const response = await fetch(`${API_URL}/api/exam-session/start`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId,
//           examId,
//           deviceInfo,
//           settings: {
//             requireFullscreen: settings.requireFullscreen,
//             maxViolations: settings.maxViolations
//           }
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         setSessionId(data.sessionId);
//         setSessionStarted(true);
//         console.log("✅ Session started:", data.sessionId);

//         if (data.kicked) {
//           showNotification("⚠️ Phiên thi cũ của bạn đã bị đóng!", "warning");
//         }

//         // Start heartbeat
//         startHeartbeat(data.sessionId);

//         // Prompt for fullscreen
//         if (settings.requireFullscreen) {
//           setFullscreenReady(true);
//         }

//         // Load saved answers if any
//         const saved = loadAnswersLocal();
//         if (saved && saved.answers) {
//           const shouldRestore = window.confirm(
//             "Phát hiện bài làm đã lưu. Bạn có muốn tiếp tục bài làm trước đó không?"
//           );
//           if (shouldRestore) {
//             setAnswers(saved.answers);
//             showNotification("✅ Đã khôi phục bài làm trước đó", "success");
//           }
//         }
//       } else {
//         throw new Error(data.message || "Không thể bắt đầu thi");
//       }
//     } catch (error) {
//       console.error("❌ Start session error:", error);
//       setError("Lỗi kết nối server: " + error.message);
//     }
//   }, [userId, examId, sessionStarted, settings, getDeviceInfo, loadAnswersLocal]);

//   // ========================
//   // 💓 HEARTBEAT
//   // ========================
//   const startHeartbeat = useCallback((sid) => {
//     if (heartbeatInterval.current) {
//       clearInterval(heartbeatInterval.current);
//     }

//     heartbeatInterval.current = setInterval(async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/exam-session/heartbeat`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ sessionId: sid })
//         });

//         const data = await response.json();

//         if (!data.valid) {
//           console.log("❌ Session invalid:", data);
//           setKicked(true);
//           clearInterval(heartbeatInterval.current);
          
//           if (data.kicked) {
//             showNotification(
//               "⚠️ Bạn đã đăng nhập từ thiết bị khác! Bài thi sẽ tự động nộp.",
//               "error"
//             );
//             handleSubmit(true);
//           }
//         }
//       } catch (error) {
//         console.error("❌ Heartbeat error:", error);
//       }
//     }, HEARTBEAT_INTERVAL);
//   }, []);

//   // Cleanup heartbeat on unmount
//   useEffect(() => {
//     return () => {
//       if (heartbeatInterval.current) {
//         clearInterval(heartbeatInterval.current);
//       }
//       if (autoSaveInterval.current) {
//         clearInterval(autoSaveInterval.current);
//       }
//     };
//   }, []);

//   // ========================
//   // 🚨 LOG VIOLATION
//   // ========================
//   const logViolation = useCallback(async (type, detail) => {
//     if (!sessionId || submitted) return;

//     try {
//       const response = await fetch(`${API_URL}/api/exam-session/violation`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId,
//           userId,
//           examId,
//           violationType: type,
//           detail
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         setViolations({
//           total: data.violationCount || 0,
//           max: data.maxViolations || settings.maxViolations
//         });

//         if (data.forceEnd) {
//           showNotification("🚫 Bạn đã vi phạm quá nhiều! Bài thi tự động nộp.", "error");
//           handleSubmit(true);
//         } else {
//           showNotification(
//             `⚠️ Vi phạm: ${type}. Còn ${data.maxViolations - data.violationCount} lần.`,
//             "warning"
//           );
//         }
//       }
//     } catch (error) {
//       console.error("❌ Log violation error:", error);
//     }
//   }, [sessionId, userId, examId, submitted, settings.maxViolations]);

//   // ========================
//   // 📋 FETCH EXAM
//   // ========================
//   useEffect(() => {
//     const fetchExam = async () => {
//       if (!userId) return;

//       try {
//         setLoading(true);
//         console.log('🔍 Fetching exam ID:', examId);

//         const token = localStorage.getItem('token');
        
//         if (!token) {
//           setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
//           setTimeout(() => {
//             if (onLogout) onLogout();
//           }, 2000);
//           return;
//         }

//         const res = await fetch(`${API_URL}/api/exams/${examId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (res.status === 401) {
//           setError('Phiên đăng nhập hết hạn!');
//           setTimeout(() => {
//             if (onLogout) onLogout();
//           }, 2000);
//           return;
//         }

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}: Không tìm thấy đề thi`);
//         }

//         const data = await res.json();
//         console.log('📥 Exam data:', data);

//         setExamInfo(data.exam || {});

//         const qWithAns = (data.questions || []).map((q) => ({
//           ...q,
//           answers: data.answers
//             ? data.answers.filter((a) => a.question_id === q.id)
//             : [],
//         }));

//         console.log('✅ Questions loaded:', qWithAns.length);
//         setQuestions(qWithAns);
//         setTimeLeft((data.exam.duration || 0) * 60);

//         // Start session after exam loaded
//         await startSession();
//       } catch (err) {
//         console.error("❌ Fetch exam error:", err);
//         setError("Lỗi: " + err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (examId && userId) {
//       fetchExam();
//     }
//   }, [examId, userId, onLogout, startSession]);

//   // ========================
//   // ⏱️ COUNTDOWN TIMER
//   // ========================
//   useEffect(() => {
//     if (submitted || timeLeft <= 0 || !sessionStarted) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           showNotification("⏰ Hết giờ! Tự động nộp bài.", "warning");
//           handleSubmit(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, submitted, sessionStarted]);

//   // ========================
//   // 🔍 DETECT TAB SWITCH
//   // ========================
//   useEffect(() => {
//     if (!sessionId || submitted) return;

//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         logViolation("TAB_SWITCH", "Chuyển sang tab/cửa sổ khác");
//       }
//     };

//     const handleBlur = () => {
//       if (!document.hidden) {
//         logViolation("WINDOW_BLUR", "Mất focus khỏi cửa sổ thi");
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     window.addEventListener("blur", handleBlur);

//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       window.removeEventListener("blur", handleBlur);
//     };
//   }, [sessionId, submitted, logViolation]);

//   // ========================
//   // 🖥️ FULLSCREEN DETECTION
//   // ========================
//   useEffect(() => {
//     if (!sessionId || submitted || !settings.requireFullscreen) return;

//     let retryCount = 0;

//     const handleFullscreenChange = () => {
//       if (!document.fullscreenElement && !submitted) {
//         logViolation("EXIT_FULLSCREEN", "Thoát chế độ toàn màn hình");

//         if (retryCount < MAX_FULLSCREEN_RETRY) {
//           setTimeout(() => {
//             showNotification("⚠️ Vui lòng quay lại chế độ toàn màn hình!", "warning");
//             setFullscreenReady(true);
//             retryCount++;
//           }, 1000);
//         } else {
//           showNotification("🚫 Thoát fullscreen quá nhiều lần!", "error");
//         }
//       }
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//     };
//   }, [sessionId, submitted, settings.requireFullscreen, logViolation]);

//   // ========================
//   // 🚫 BLOCK COPY/PASTE/RIGHT-CLICK
//   // ========================
//   useEffect(() => {
//     if (!sessionId || submitted) return;

//     const {blockCopy, blockRightClick} = settings;

//     const handleCopy = (e) => {
//       if (blockCopy) {
//         e.preventDefault();
//         logViolation("COPY_ATTEMPT", "Cố gắng copy nội dung");
//       }
//     };

//     const handleContextMenu = (e) => {
//       if (blockRightClick) {
//         e.preventDefault();
//         logViolation("RIGHT_CLICK", "Nhấn chuột phải");
//       }
//     };

//     const handleSelectStart = (e) => {
//       if (blockCopy) {
//         if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
//           return;
//         }
//         e.preventDefault();
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (
//         (e.ctrlKey && e.key === "c") ||
//         e.key === "F12" ||
//         (e.ctrlKey && e.shiftKey && e.key === "I")
//       ) {
//         e.preventDefault();
//         logViolation("KEYBOARD_SHORTCUT", `Phím tắt: ${e.key}`);
//       }
//     };

//     document.addEventListener("copy", handleCopy);
//     document.addEventListener("contextmenu", handleContextMenu);
//     document.addEventListener("selectstart", handleSelectStart);
//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("copy", handleCopy);
//       document.removeEventListener("contextmenu", handleContextMenu);
//       document.removeEventListener("selectstart", handleSelectStart);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [sessionId, submitted, settings, logViolation]);

//   // ========================
//   // 🖼️ FULLSCREEN CONTROL
//   // ========================
//   const enterFullscreen = () => {
//     if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
//       fullscreenRef.current.requestFullscreen()
//         .then(() => {
//           setFullscreenReady(false);
//           showNotification("✅ Đã vào chế độ toàn màn hình", "success");
//         })
//         .catch(err => {
//           console.error("❌ Fullscreen error:", err);
//           showNotification("❌ Không thể vào fullscreen. Trình duyệt không hỗ trợ.", "error");
//           setFullscreenReady(false);
//         });
//     }
//   };

//   // ========================
//   // ✅ SELECT ANSWER
//   // ========================
//   const handleSelect = useCallback((qid, value) => {
//     if (submitted) return;
//     setAnswers((prev) => {
//       const newAnswers = { ...prev, [qid]: value };
//       return newAnswers;
//     });
//   }, [submitted]);

//   // ========================
//   // 📤 SUBMIT EXAM
//   // ========================
//   const handleSubmit = useCallback(async (isForced = false) => {
//     if (submitted) return;

//     if (!isForced) {
//       const confirmed = window.confirm(
//         `Bạn có chắc muốn nộp bài?\n\n` +
//         `Đã làm: ${Object.keys(answers).length}/${questions.length} câu\n` +
//         `Thời gian còn lại: ${formatTime(timeLeft)}`
//       );
//       if (!confirmed) return;
//     }

//     setSubmitted(true);

//     if (heartbeatInterval.current) {
//       clearInterval(heartbeatInterval.current);
//     }

//     if (autoSaveInterval.current) {
//       clearInterval(autoSaveInterval.current);
//     }

//     if (document.fullscreenElement) {
//       document.exitFullscreen().catch(err => {
//         console.error("Exit fullscreen error:", err);
//       });
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/exam-session/submit`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId,
//           userId,
//           examId,
//           answers,
//           isForced
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult(data.result);
//         console.log("✅ Submitted successfully:", data.result);
        
//         clearAnswersLocal();
        
//         showNotification("✅ Nộp bài thành công!", "success");
//       } else {
//         throw new Error(data.message || "Lỗi nộp bài");
//       }
//     } catch (error) {
//       console.error("❌ Submit error:", error);
//       setError("Lỗi kết nối khi nộp bài: " + error.message);
//       setSubmitted(false);
//     }
//   }, [submitted, answers, questions.length, timeLeft, sessionId, userId, examId, clearAnswersLocal]);

//   // ========================
//   // 🎨 HELPERS
//   // ========================
//   const formatTime = (sec) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
    
//     if (h > 0) {
//       return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//     }
//     return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   const showNotification = (message, type = "info") => {
//     console.log(`[${type.toUpperCase()}] ${message}`);
    
//     if (type === "error") {
//       alert(message);
//     }
//   };

//   // ========================
//   // 🔄 LOADING STATE
//   // ========================
//   if (loading) {
//     return (
//       <div className="do-exam-page loading-state">
//         <div className="loader">
//           <div className="spinner"></div>
//           <p>Đang tải đề thi...</p>
//         </div>
//       </div>
//     );
//   }

//   // ========================
//   // ❌ ERROR STATE
//   // ========================
//   if (error) {
//     return (
//       <div className="do-exam-page error-state">
//         <div className="error-card">
//           <h2>❌ Lỗi</h2>
//           <p>{error}</p>
//           <button onClick={onNavigateHome}>Về trang chủ</button>
//         </div>
//       </div>
//     );
//   }

//   // ========================
//   // 📋 NO EXAM FOUND
//   // ========================
//   if (!examInfo) {
//     return (
//       <div className="do-exam-page">
//         <p>Không tìm thấy đề thi</p>
//         <button onClick={onNavigateHome}>Về trang chủ</button>
//       </div>
//     );
//   }

//   // ========================
//   // 🎉 RESULT PAGE
//   // ========================
//   if (submitted && result) {
//     return (
//       <div className="do-exam-page">
//         <Navbar
//           onLogout={onLogout}
//           onNavigateHome={onNavigateHome}
//           onShowTeachers={onShowTeachers}
//           onShowStudents={onShowStudents}
//           onShowExamBank={onShowExamBank}
//           onShowCreateExam={onShowCreateExam}
//         />

//         <div className="do-exam-container">
//           <div className="result-card">
//             <h1>🎉 Hoàn thành bài thi!</h1>
            
//             <div className="score-display">
//               <h2>Điểm: {result.score} / {result.totalPoints}</h2>
//               <p className="percentage">({result.percentage}%)</p>
//               {result.passed && <p className="pass-badge">✅ ĐẠT</p>}
//             </div>

//             <div className="stats">
//               <div className="stat-item">
//                 <span className="label">✅ Đúng:</span>
//                 <span className="value">{result.correct}</span>
//               </div>
//               <div className="stat-item">
//                 <span className="label">❌ Sai:</span>
//                 <span className="value">{result.wrong}</span>
//               </div>
//               <div className="stat-item">
//                 <span className="label">⚠️ Chưa làm:</span>
//                 <span className="value">{result.unanswered}</span>
//               </div>
//               <div className="stat-item">
//                 <span className="label">🚨 Vi phạm:</span>
//                 <span className="value">{result.totalViolations}</span>
//               </div>
//             </div>

//             {result.totalViolations > 0 && (
//               <div className="violation-details">
//                 <h3>Chi tiết vi phạm:</h3>
//                 <ul>
//                   {Object.entries(result.violations).map(([type, count]) => (
//                     <li key={type}>{type}: {count} lần</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <button className="btn-home" onClick={onNavigateHome}>
//               Về trang chủ
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ========================
//   // 📝 EXAM PAGE
//   // ========================
//   return (
//     <div ref={fullscreenRef} className="do-exam-page">
//       <Navbar
//         onLogout={onLogout}
//         onNavigateHome={onNavigateHome}
//         onShowTeachers={onShowTeachers}
//         onShowStudents={onShowStudents}
//         onShowExamBank={onShowExamBank}
//         onShowCreateExam={onShowCreateExam}
//       />

//       {fullscreenReady && (
//         <div className="fullscreen-prompt-overlay">
//           <div className="fullscreen-prompt">
//             <h2>🖥️ Yêu cầu Fullscreen</h2>
//             <p>Bài thi yêu cầu chế độ toàn màn hình để chống gian lận.</p>
//             <button onClick={enterFullscreen} className="btn-fullscreen">
//               Vào Fullscreen
//             </button>
//           </div>
//         </div>
//       )}

//       {kicked && (
//         <div className="kicked-overlay">
//           <div className="kicked-modal">
//             <h2>⚠️ Phiên thi đã kết thúc</h2>
//             <p>Bạn đã đăng nhập từ thiết bị khác hoặc vi phạm quá nhiều lần.</p>
//             <p>Bài thi đã được tự động nộp.</p>
//           </div>
//         </div>
//       )}

//       <div className="timer-floating">
//         ⏳ {formatTime(timeLeft)}
//         {violations.total > 0 && (
//           <div className="violation-badge">
//             🚨 {violations.total}/{violations.max || settings.maxViolations}
//           </div>
//         )}
//       </div>

//       <div className="do-exam-container">
//         <h1 className="exam-title">{examInfo.title}</h1>

//         {violations.total > 0 && violations.total < (violations.max || settings.maxViolations) && (
//           <div className="warning-banner">
//             ⚠️ Cảnh báo: Bạn đã vi phạm {violations.total} lần. 
//             Còn {(violations.max || settings.maxViolations) - violations.total} lần trước khi tự động nộp bài!
//           </div>
//         )}

//         <div className="question-list">
//           {questions.map((q, index) => (
//             <div className="question-card" key={q.id}>
//               <p className="question-text">
//                 <strong>Câu {index + 1}:</strong> {q.question_text} ({q.points || 1} điểm)
//               </p>

//               <div className="choices">
//                 {q.answers.length > 0 ? (
//                   q.answers.map((a) => (
//                     <label className="choice-item" key={a.id}>
//                       <input
//                         type="radio"
//                         name={`q-${q.id}`}
//                         value={a.id}
//                         checked={answers[q.id] === a.id}
//                         onChange={() => handleSelect(q.id, a.id)}
//                         disabled={submitted}
//                       />
//                       <span>{a.answer_text}</span>
//                     </label>
//                   ))
//                 ) : (
//                   <p className="no-answers">❌ Chưa có đáp án</p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="submit-section">
//           <p className="answer-count">
//             Đã làm: {Object.keys(answers).length}/{questions.length} câu
//           </p>
//           <button 
//             className="submit-btn" 
//             onClick={() => handleSubmit(false)} 
//             disabled={submitted || kicked}
//           >
//             {submitted ? "Đang nộp..." : "Nộp bài"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoExamPage;


import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../Navbar/Navbar";
import "./DoExamPage.css";
import useAuth from '../useAuth';

const DoExamPage = ({
  examId,
  onLogout,
  onNavigateHome,
  onShowTeachers,
  onShowStudents,
  onShowExamBank,
  onShowCreateExam,
}) => {
  // ✅ Lấy user từ AuthContext
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  // ========================
  // STATES
  // ========================
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Anti-cheat states
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [violations, setViolations] = useState({ total: 0 });
  const [settings, setSettings] = useState({
    requireFullscreen: true,
    maxViolations: 3,
    blockCopy: true,
    blockRightClick: true
  });
  const [kicked, setKicked] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [error, setError] = useState(null);

  // ========================
  // REFS
  // ========================
  const fullscreenRef = useRef(null);
  const heartbeatInterval = useRef(null);
  const autoSaveInterval = useRef(null);
  const handleSubmitRef = useRef(null); // ⭐ REF cho handleSubmit

  // ========================
  // CONFIG
  // ========================
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const HEARTBEAT_INTERVAL = 15000;
  const AUTOSAVE_INTERVAL = 30000;
  const MAX_FULLSCREEN_RETRY = 3;

  // ========================
  // VALIDATION
  // ========================
  useEffect(() => {
    if (!userId) {
      setError("Vui lòng đăng nhập để thi!");
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
    }
  }, [userId, onLogout]);

  // ========================
  // 🔐 Get Device Info
  // ========================
  const getDeviceInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser: (() => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
      })(),
      os: navigator.platform.includes('Win') ? 'Windows' 
        : navigator.platform.includes('Mac') ? 'macOS'
        : navigator.platform.includes('Linux') ? 'Linux' : 'Unknown',
      timestamp: new Date().toISOString()
    };
  }, []);

  // ========================
  // 💾 AUTO-SAVE
  // ========================
  const saveAnswersLocal = useCallback(() => {
    if (!examId || !userId) return;
    
    const key = `exam_${examId}_user_${userId}_answers`;
    try {
      localStorage.setItem(key, JSON.stringify({
        answers,
        timestamp: Date.now(),
        timeLeft
      }));
    } catch (err) {
      console.error("❌ Save answers error:", err);
    }
  }, [examId, userId, answers, timeLeft]);

  const loadAnswersLocal = useCallback(() => {
    if (!examId || !userId) return null;
    
    const key = `exam_${examId}_user_${userId}_answers`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (err) {
      console.error("❌ Load answers error:", err);
    }
    return null;
  }, [examId, userId]);

  const clearAnswersLocal = useCallback(() => {
    if (!examId || !userId) return;
    
    const key = `exam_${examId}_user_${userId}_answers`;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("❌ Clear answers error:", err);
    }
  }, [examId, userId]);

  // Auto-save interval
  useEffect(() => {
    if (!sessionStarted || submitted) return;

    autoSaveInterval.current = setInterval(saveAnswersLocal, AUTOSAVE_INTERVAL);

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [sessionStarted, submitted, saveAnswersLocal, AUTOSAVE_INTERVAL]);

  // ========================
  // 💓 HEARTBEAT (⭐ FIXED)
  // ========================
  const startHeartbeat = useCallback((sid) => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/exam-session/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid })
        });

        const data = await response.json();

        if (!data.valid) {
          console.log("❌ Session invalid:", data);
          setKicked(true);
          clearInterval(heartbeatInterval.current);
          
          if (data.kicked) {
            alert("⚠️ Bạn đã đăng nhập từ thiết bị khác! Bài thi sẽ tự động nộp.");
            
            // ⭐ DÙNG REF thay vì direct call
            if (handleSubmitRef.current) {
              handleSubmitRef.current(true);
            }
          }
        }
      } catch (error) {
        console.error("❌ Heartbeat error:", error);
      }
    }, HEARTBEAT_INTERVAL);
  }, [API_URL, HEARTBEAT_INTERVAL]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  // ========================
  // 🚀 START SESSION
  // ========================
  const startSession = useCallback(async () => {
    if (!userId || sessionStarted) return;

    try {
      const deviceInfo = getDeviceInfo();

      const response = await fetch(`${API_URL}/api/exam-session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          examId,
          deviceInfo,
          settings: {
            requireFullscreen: settings.requireFullscreen,
            maxViolations: settings.maxViolations
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setSessionStarted(true);
        console.log("✅ Session started:", data.sessionId);

        if (data.kicked) {
          console.log("⚠️ Phiên thi cũ đã bị đóng!");
        }

        startHeartbeat(data.sessionId);

        if (settings.requireFullscreen) {
          setFullscreenReady(true);
        }

        const saved = loadAnswersLocal();
        if (saved && saved.answers) {
          const shouldRestore = window.confirm(
            "Phát hiện bài làm đã lưu. Bạn có muốn tiếp tục bài làm trước đó không?"
          );
          if (shouldRestore) {
            setAnswers(saved.answers);
          }
        }
      } else {
        throw new Error(data.message || "Không thể bắt đầu thi");
      }
    } catch (error) {
      console.error("❌ Start session error:", error);
      setError("Lỗi kết nối server: " + error.message);
    }
  }, [userId, examId, sessionStarted, settings, getDeviceInfo, loadAnswersLocal, startHeartbeat, API_URL]);

  // ========================
  // 🚨 LOG VIOLATION
  // ========================
  const logViolation = useCallback(async (type, detail) => {
    if (!sessionId || submitted) return;

    try {
      const response = await fetch(`${API_URL}/api/exam-session/violation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId,
          examId,
          violationType: type,
          detail
        })
      });

      const data = await response.json();

      if (data.success) {
        setViolations({
          total: data.violationCount || 0,
          max: data.maxViolations || settings.maxViolations
        });

        if (data.forceEnd) {
          alert("🚫 Bạn đã vi phạm quá nhiều! Bài thi tự động nộp.");
          if (handleSubmitRef.current) {
            handleSubmitRef.current(true);
          }
        }
      }
    } catch (error) {
      console.error("❌ Log violation error:", error);
    }
  }, [sessionId, userId, examId, submitted, settings.maxViolations, API_URL]);

  // ========================
  // 📋 FETCH EXAM
  // ========================
  useEffect(() => {
    const fetchExam = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        console.log('🔍 Fetching exam ID:', examId);

        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          setTimeout(() => {
            if (onLogout) onLogout();
          }, 2000);
          return;
        }

        const res = await fetch(`${API_URL}/api/exams/${examId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          setError('Phiên đăng nhập hết hạn!');
          setTimeout(() => {
            if (onLogout) onLogout();
          }, 2000);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Không tìm thấy đề thi`);
        }

        const data = await res.json();
        console.log('📥 Exam data:', data);

        setExamInfo(data.exam || {});

        const qWithAns = (data.questions || []).map((q) => ({
          ...q,
          answers: data.answers
            ? data.answers.filter((a) => a.question_id === q.id)
            : [],
        }));

        console.log('✅ Questions loaded:', qWithAns.length);
        setQuestions(qWithAns);
        setTimeLeft((data.exam.duration || 0) * 60);

        await startSession();
      } catch (err) {
        console.error("❌ Fetch exam error:", err);
        setError("Lỗi: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (examId && userId) {
      fetchExam();
    }
  }, [examId, userId, onLogout, startSession, API_URL]);

  // ========================
  // ⏱️ COUNTDOWN TIMER
  // ========================
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !sessionStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⏰ Hết giờ! Tự động nộp bài.");
          if (handleSubmitRef.current) {
            handleSubmitRef.current(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, sessionStarted]);

  // ========================
  // 🔍 DETECT TAB SWITCH
  // ========================
  useEffect(() => {
    if (!sessionId || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("TAB_SWITCH", "Chuyển sang tab/cửa sổ khác");
      }
    };

    const handleBlur = () => {
      if (!document.hidden) {
        logViolation("WINDOW_BLUR", "Mất focus khỏi cửa sổ thi");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionId, submitted, logViolation]);

  // ========================
  // 🖥️ FULLSCREEN DETECTION
  // ========================
  useEffect(() => {
    if (!sessionId || submitted || !settings.requireFullscreen) return;

    let retryCount = 0;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
        logViolation("EXIT_FULLSCREEN", "Thoát chế độ toàn màn hình");

        if (retryCount < MAX_FULLSCREEN_RETRY) {
          setTimeout(() => {
            setFullscreenReady(true);
            retryCount++;
          }, 1000);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId, submitted, settings.requireFullscreen, logViolation, MAX_FULLSCREEN_RETRY]);

  // ========================
  // 🚫 BLOCK COPY/PASTE
  // ========================
  useEffect(() => {
    if (!sessionId || submitted) return;

    const {blockCopy, blockRightClick} = settings;

    const handleCopy = (e) => {
      if (blockCopy) {
        e.preventDefault();
        logViolation("COPY_ATTEMPT", "Cố gắng copy nội dung");
      }
    };

    const handleContextMenu = (e) => {
      if (blockRightClick) {
        e.preventDefault();
        logViolation("RIGHT_CLICK", "Nhấn chuột phải");
      }
    };

    const handleSelectStart = (e) => {
      if (blockCopy) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.key === "c") ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I")
      ) {
        e.preventDefault();
        logViolation("KEYBOARD_SHORTCUT", `Phím tắt: ${e.key}`);
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sessionId, submitted, settings, logViolation]);

  // ========================
  // 🖼️ FULLSCREEN
  // ========================
  const enterFullscreen = () => {
    if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
      fullscreenRef.current.requestFullscreen()
        .then(() => {
          setFullscreenReady(false);
        })
        .catch(err => {
          console.error("❌ Fullscreen error:", err);
          setFullscreenReady(false);
        });
    }
  };

  // ========================
  // ✅ SELECT ANSWER
  // ========================
  const handleSelect = useCallback((qid, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, [submitted]);

  // ========================
  // 📤 SUBMIT EXAM
  // ========================
  const handleSubmit = useCallback(async (isForced = false) => {
    if (submitted) return;

    if (!isForced) {
      const confirmed = window.confirm(
        `Bạn có chắc muốn nộp bài?\n\n` +
        `Đã làm: ${Object.keys(answers).length}/${questions.length} câu\n` +
        `Thời gian còn lại: ${formatTime(timeLeft)}`
      );
      if (!confirmed) return;
    }

    setSubmitted(true);

    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error("Exit fullscreen error:", err);
      });
    }

    try {
      const response = await fetch(`${API_URL}/api/exam-session/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId,
          examId,
          answers,
          isForced
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        console.log("✅ Submitted successfully:", data.result);
        clearAnswersLocal();
      } else {
        throw new Error(data.message || "Lỗi nộp bài");
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      setError("Lỗi kết nối khi nộp bài: " + error.message);
      setSubmitted(false);
    }
  }, [submitted, answers, questions.length, timeLeft, sessionId, userId, examId, clearAnswersLocal, API_URL]);

  // ⭐ UPDATE REF khi handleSubmit thay đổi
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // ========================
  // 🎨 HELPERS
  // ========================
  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ========================
  // 🔄 LOADING
  // ========================
  if (loading) {
    return (
      <div className="do-exam-page loading-state">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  // ========================
  // ❌ ERROR
  // ========================
  if (error) {
    return (
      <div className="do-exam-page error-state">
        <div className="error-card">
          <h2>❌ Lỗi</h2>
          <p>{error}</p>
          <button onClick={onNavigateHome}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="do-exam-page">
        <p>Không tìm thấy đề thi</p>
        <button onClick={onNavigateHome}>Về trang chủ</button>
      </div>
    );
  }

  // ========================
  // 🎉 RESULT PAGE
  // ========================
  if (submitted && result) {
    return (
      <div className="do-exam-page">
        <Navbar
          onLogout={onLogout}
          onNavigateHome={onNavigateHome}
          onShowTeachers={onShowTeachers}
          onShowStudents={onShowStudents}
          onShowExamBank={onShowExamBank}
          onShowCreateExam={onShowCreateExam}
        />

        <div className="do-exam-container">
          <div className="result-card">
            <h1>🎉 Hoàn thành bài thi!</h1>
            
            <div className="score-display">
              <h2>Điểm: {result.score} / {result.totalPoints}</h2>
              <p className="percentage">({result.percentage}%)</p>
              {result.passed && <p className="pass-badge">✅ ĐẠT</p>}
            </div>

            <div className="stats">
              <div className="stat-item">
                <span className="label">✅ Đúng:</span>
                <span className="value">{result.correct}</span>
              </div>
              <div className="stat-item">
                <span className="label">❌ Sai:</span>
                <span className="value">{result.wrong}</span>
              </div>
              <div className="stat-item">
                <span className="label">⚠️ Chưa làm:</span>
                <span className="value">{result.unanswered}</span>
              </div>
              <div className="stat-item">
                <span className="label">🚨 Vi phạm:</span>
                <span className="value">{result.totalViolations}</span>
              </div>
            </div>

            {result.totalViolations > 0 && (
              <div className="violation-details">
                <h3>Chi tiết vi phạm:</h3>
                <ul>
                  {Object.entries(result.violations).map(([type, count]) => (
                    <li key={type}>{type}: {count} lần</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-home" onClick={onNavigateHome}>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // 📝 EXAM PAGE
  // ========================
  return (
    <div ref={fullscreenRef} className="do-exam-page">
      <Navbar
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        onShowTeachers={onShowTeachers}
        onShowStudents={onShowStudents}
        onShowExamBank={onShowExamBank}
        onShowCreateExam={onShowCreateExam}
      />

      {fullscreenReady && (
        <div className="fullscreen-prompt-overlay">
          <div className="fullscreen-prompt">
            <h2>🖥️ Yêu cầu Fullscreen</h2>
            <p>Bài thi yêu cầu chế độ toàn màn hình để chống gian lận.</p>
            <button onClick={enterFullscreen} className="btn-fullscreen">
              Vào Fullscreen
            </button>
          </div>
        </div>
      )}

      {kicked && (
        <div className="kicked-overlay">
          <div className="kicked-modal">
            <h2>⚠️ Phiên thi đã kết thúc</h2>
            <p>Bạn đã đăng nhập từ thiết bị khác hoặc vi phạm quá nhiều lần.</p>
            <p>Bài thi đã được tự động nộp.</p>
          </div>
        </div>
      )}

      <div className="timer-floating">
        ⏳ {formatTime(timeLeft)}
        {violations.total > 0 && (
          <div className="violation-badge">
            🚨 {violations.total}/{violations.max || settings.maxViolations}
          </div>
        )}
      </div>

      <div className="do-exam-container">
        <h1 className="exam-title">{examInfo.title}</h1>

        {violations.total > 0 && violations.total < (violations.max || settings.maxViolations) && (
          <div className="warning-banner">
            ⚠️ Cảnh báo: Bạn đã vi phạm {violations.total} lần. 
            Còn {(violations.max || settings.maxViolations) - violations.total} lần trước khi tự động nộp bài!
          </div>
        )}

        <div className="question-list">
          {questions.map((q, index) => (
            <div className="question-card" key={q.id}>
              <p className="question-text">
                <strong>Câu {index + 1}:</strong> {q.question_text} ({q.points || 1} điểm)
              </p>

              <div className="choices">
                {q.answers.length > 0 ? (
                  q.answers.map((a) => (
                    <label className="choice-item" key={a.id}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={a.id}
                        checked={answers[q.id] === a.id}
                        onChange={() => handleSelect(q.id, a.id)}
                        disabled={submitted}
                      />
                      <span>{a.answer_text}</span>
                    </label>
                  ))
                ) : (
                  <p className="no-answers">❌ Chưa có đáp án</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="submit-section">
          <p className="answer-count">
            Đã làm: {Object.keys(answers).length}/{questions.length} câu
          </p>
          <button 
            className="submit-btn" 
            onClick={() => handleSubmit(false)} 
            disabled={submitted || kicked}
          >
            {submitted ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoExamPage;

