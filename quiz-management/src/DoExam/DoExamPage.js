// // import React, { useEffect, useState, useRef } from "react";
// // import Navbar from "../Navbar/Navbar";
// // import "./DoExamPage.css";
// // import { API_URL } from "../config/api";

// // const DoExamPage = ({
// //   examId,
// //   user,              // ⭐ THÊM
// //   onUpdateUser,      // ⭐ THÊM
// //   onLogout,          // ⭐ THÊM
// //   onNavigateHome,
// //   onShowTeachers,
// //   onShowStudents,
// //   onShowExamBank,
// //   onShowCreateExam,
// // }) => {
// //   const [examInfo, setExamInfo] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [submitted, setSubmitted] = useState(false);
// //   const [result, setResult] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [timeLeft, setTimeLeft] = useState(0);

// //   // 🔒 Anti-cheat states
// //   const [sessionId, setSessionId] = useState(null);
// //   const [violations, setViolations] = useState({
// //     tabSwitch: 0,
// //     copyAttempt: 0,
// //     exitFullscreen: 0,
// //     total: 0
// //   });
// //   const [settings, setSettings] = useState({
// //     requireFullscreen: true,
// //     maxViolations: 3,
// //     blockCopy: true,
// //     blockRightClick: true
// //   });
// //   const [kicked, setKicked] = useState(false);

// //   const fullscreenRef = useRef(null);
// //   const heartbeatInterval = useRef(null);

// //   // ⭐ LẤY USER ID TỪ PROP
// //   const userId = user?.id || 3;

// //   const apiUrl = process.env.REACT_APP_API_URL || '${API_URL}';

// //   // ========================
// //   // 🔐 Lấy thông tin thiết bị
// //   // ========================
// //   const getDeviceInfo = () => {
// //     return {
// //       userAgent: navigator.userAgent,
// //       platform: navigator.platform,
// //       language: navigator.language,
// //       screenResolution: `${window.screen.width}x${window.screen.height}`,
// //       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// //       timestamp: new Date().toISOString()
// //     };
// //   };

// //   // ========================
// //   // 🚀 Bắt đầu session
// //   // ========================
// //   const startSession = async () => {
// //     try {
// //       const deviceInfo = getDeviceInfo();

// //       const response = await fetch(`${apiUrl}/api/exam-session/start`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           userId,
// //           examId,
// //           deviceInfo,
// //           settings: {
// //             requireFullscreen: settings.requireFullscreen,
// //             maxViolations: settings.maxViolations
// //           }
// //         })
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         setSessionId(data.sessionId);
// //         console.log("✅ Session started:", data.sessionId);

// //         if (data.kicked) {
// //           alert("⚠️ Phiên thi cũ của bạn đã bị đóng!");
// //         }

// //         // Bắt đầu heartbeat
// //         startHeartbeat(data.sessionId);

// //         // Fullscreen nếu cần
// //         if (settings.requireFullscreen) {
// //           enterFullscreen();
// //         }
// //       } else {
// //         alert("❌ Không thể bắt đầu thi: " + data.message);
// //       }
// //     } catch (error) {
// //       console.error("❌ Start session error:", error);
// //       alert("Lỗi kết nối server!");
// //     }
// //   };

// //   // ========================
// //   // 💓 Heartbeat - Kiểm tra session
// //   // ========================
// //   const startHeartbeat = (sid) => {
// //     heartbeatInterval.current = setInterval(async () => {
// //       try {
// //         const response = await fetch(`${apiUrl}/api/exam-session/heartbeat`, {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ sessionId: sid })
// //         });

// //         const data = await response.json();

// //         if (!data.valid) {
// //           console.log("❌ Session không valid:", data);
// //           setKicked(true);
// //           clearInterval(heartbeatInterval.current);
          
// //           if (data.kicked) {
// //             alert("⚠️ Bạn đã đăng nhập từ thiết bị khác! Bài thi sẽ bị nộp.");
// //             handleSubmit(true);
// //           }
// //         }
// //       } catch (error) {
// //         console.error("❌ Heartbeat error:", error);
// //       }
// //     }, 5000); // Mỗi 5 giây
// //   };

// //   // ========================
// //   // 🚨 Ghi log vi phạm
// //   // ========================
// //   const logViolation = async (type, detail) => {
// //     if (!sessionId || submitted) return;

// //     try {
// //       const response = await fetch(`${apiUrl}/api/exam-session/violation`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           sessionId,
// //           userId,
// //           examId,
// //           violationType: type,
// //           detail
// //         })
// //       });

// //       const data = await response.json();

// //       if (data.forceEnd) {
// //         alert("🚫 Bạn đã vi phạm quá nhiều! Bài thi sẽ tự động nộp.");
// //         handleSubmit(true);
// //       }
// //     } catch (error) {
// //       console.error("❌ Log violation error:", error);
// //     }
// //   };

// //   // ========================
// //   // 📋 Fetch đề thi
// //   // ========================
// //   useEffect(() => {
// //     const fetchExam = async () => {
// //       try {
// //         setLoading(true);
// //         console.log('🔍 Fetching exam ID:', examId);

// //         // ⭐ THÊM TOKEN
// //         const token = localStorage.getItem('token');
        
// //         if (!token) {
// //           console.error('❌ No token found!');
// //           alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
// //           if (onLogout) onLogout();
// //           return;
// //         }

// //         const res = await fetch(`${apiUrl}/api/exams/${examId}`, {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,  // ⭐ THÊM TOKEN
// //             'Content-Type': 'application/json'
// //           }
// //         });

// //         console.log('📡 Response status:', res.status);

// //         if (res.status === 401) {
// //           alert('Phiên đăng nhập hết hạn!');
// //           if (onLogout) onLogout();
// //           return;
// //         }

// //         if (!res.ok) {
// //           throw new Error(`HTTP ${res.status}: Không tìm thấy đề thi`);
// //         }

// //         const data = await res.json();
// //         console.log('📥 Exam data:', data);

// //         setExamInfo(data.exam || {});

// //         const qWithAns = (data.questions || []).map((q) => ({
// //           ...q,
// //           answers: data.answers
// //             ? data.answers.filter((a) => a.question_id === q.id)
// //             : [],
// //         }));

// //         console.log('✅ Questions loaded:', qWithAns.length);
// //         setQuestions(qWithAns);
// //         setTimeLeft((data.exam.duration || 0) * 60);

// //         // Bắt đầu session sau khi load xong
// //         await startSession();
// //       } catch (err) {
// //         console.error("❌ Fetch exam error:", err);
// //         alert("Lỗi: " + err.message);
// //         setExamInfo(null);
// //         setQuestions([]);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (examId) {
// //       fetchExam();
// //     }

// //     return () => {
// //       // Cleanup heartbeat khi unmount
// //       if (heartbeatInterval.current) {
// //         clearInterval(heartbeatInterval.current);
// //       }
// //     };
// //   }, [examId]);

// //   // ========================
// //   // ⏱️ Đếm ngược thời gian
// //   // ========================
// //   useEffect(() => {
// //     if (submitted || timeLeft <= 0) return;

// //     const timer = setInterval(() => {
// //       setTimeLeft((prev) => {
// //         if (prev <= 1) {
// //           clearInterval(timer);
// //           handleSubmit(true); // Hết giờ = force submit
// //           return 0;
// //         }
// //         return prev - 1;
// //       });
// //     }, 1000);

// //     return () => clearInterval(timer);
// //   }, [timeLeft, submitted]);

// //   // ========================
// //   // 🔍 Phát hiện chuyển tab
// //   // ========================
// //   useEffect(() => {
// //     if (!sessionId || submitted) return;

// //     const handleVisibilityChange = () => {
// //       if (document.hidden) {
// //         setViolations(prev => ({
// //           ...prev,
// //           tabSwitch: prev.tabSwitch + 1,
// //           total: prev.total + 1
// //         }));
// //         logViolation("TAB_SWITCH", "Chuyển sang tab/cửa sổ khác");
// //       }
// //     };

// //     const handleBlur = () => {
// //       if (!document.hidden) {
// //         logViolation("WINDOW_BLUR", "Mất focus khỏi cửa sổ thi");
// //       }
// //     };

// //     document.addEventListener("visibilitychange", handleVisibilityChange);
// //     window.addEventListener("blur", handleBlur);

// //     return () => {
// //       document.removeEventListener("visibilitychange", handleVisibilityChange);
// //       window.removeEventListener("blur", handleBlur);
// //     };
// //   }, [sessionId, submitted]);

// //   // ========================
// //   // 🖥️ Phát hiện thoát fullscreen
// //   // ========================
// //   useEffect(() => {
// //     if (!sessionId || submitted || !settings.requireFullscreen) return;

// //     const handleFullscreenChange = () => {
// //       if (!document.fullscreenElement) {
// //         setViolations(prev => ({
// //           ...prev,
// //           exitFullscreen: prev.exitFullscreen + 1,
// //           total: prev.total + 1
// //         }));
// //         logViolation("EXIT_FULLSCREEN", "Thoát chế độ toàn màn hình");

// //         // Yêu cầu vào lại
// //         setTimeout(() => {
// //           if (!submitted) {
// //             enterFullscreen();
// //           }
// //         }, 1000);
// //       }
// //     };

// //     document.addEventListener("fullscreenchange", handleFullscreenChange);

// //     return () => {
// //       document.removeEventListener("fullscreenchange", handleFullscreenChange);
// //     };
// //   }, [sessionId, submitted, settings.requireFullscreen]);

// //   // ========================
// //   // 🚫 Chặn copy, right-click, shortcuts
// //   // ========================
// //   useEffect(() => {
// //     if (!sessionId || submitted) return;

// //     const handleCopy = (e) => {
// //       if (settings.blockCopy) {
// //         e.preventDefault();
// //         setViolations(prev => ({
// //           ...prev,
// //           copyAttempt: prev.copyAttempt + 1,
// //           total: prev.total + 1
// //         }));
// //         logViolation("COPY_ATTEMPT", "Cố gắng copy nội dung");
// //       }
// //     };

// //     const handleContextMenu = (e) => {
// //       if (settings.blockRightClick) {
// //         e.preventDefault();
// //       }
// //     };

// //     const handleSelectStart = (e) => {
// //       if (settings.blockCopy) {
// //         e.preventDefault();
// //       }
// //     };

// //     const handleKeyDown = (e) => {
// //       // Chặn Ctrl+C, Ctrl+A, F12, Ctrl+Shift+I
// //       if (
// //         (e.ctrlKey && (e.key === "c" || e.key === "a")) ||
// //         e.key === "F12" ||
// //         (e.ctrlKey && e.shiftKey && e.key === "I")
// //       ) {
// //         e.preventDefault();
// //         logViolation("KEYBOARD_SHORTCUT", `Phím tắt: ${e.key}`);
// //       }
// //     };

// //     document.addEventListener("copy", handleCopy);
// //     document.addEventListener("contextmenu", handleContextMenu);
// //     document.addEventListener("selectstart", handleSelectStart);
// //     document.addEventListener("keydown", handleKeyDown);

// //     return () => {
// //       document.removeEventListener("copy", handleCopy);
// //       document.removeEventListener("contextmenu", handleContextMenu);
// //       document.removeEventListener("selectstart", handleSelectStart);
// //       document.removeEventListener("keydown", handleKeyDown);
// //     };
// //   }, [sessionId, submitted, settings]);

// //   // ========================
// //   // 🖼️ Fullscreen
// //   // ========================
// //   const enterFullscreen = () => {
// //     if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
// //       fullscreenRef.current.requestFullscreen().catch(err => {
// //         console.error("❌ Fullscreen error:", err);
// //       });
// //     }
// //   };

// //   // ========================
// //   // ✅ Chọn đáp án
// //   // ========================
// //   const handleSelect = (qid, value) => {
// //     if (submitted) return;
// //     setAnswers((prev) => ({ ...prev, [qid]: value }));
// //   };

// //   // ========================
// //   // 📤 Nộp bài
// //   // ========================
// //   const handleSubmit = async (isForced = false) => {
// //     if (submitted) return;

// //     setSubmitted(true);

// //     // Stop heartbeat
// //     if (heartbeatInterval.current) {
// //       clearInterval(heartbeatInterval.current);
// //     }

// //     // Thoát fullscreen
// //     if (document.fullscreenElement) {
// //       document.exitFullscreen();
// //     }

// //     try {
// //       const response = await fetch(`${apiUrl}/api/exam-session/submit`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           sessionId,
// //           userId,
// //           examId,
// //           answers,
// //           isForced
// //         })
// //       });

// //       const data = await response.json();

// //       if (data.success) {
// //         setResult(data.result);
// //         console.log("✅ Nộp bài thành công:", data.result);
// //       } else {
// //         alert("❌ Lỗi nộp bài: " + data.message);
// //       }
// //     } catch (error) {
// //       console.error("❌ Submit error:", error);
// //       alert("Lỗi kết nối server khi nộp bài!");
// //     }
// //   };

// //   // ========================
// //   // 🎨 Format time
// //   // ========================
// //   const formatTime = (sec) => {
// //     const m = Math.floor(sec / 60).toString().padStart(2, "0");
// //     const s = (sec % 60).toString().padStart(2, "0");
// //     return `${m}:${s}`;
// //   };

// //   // ========================
// //   // 🔄 Loading
// //   // ========================
// //   if (loading) return <div className="do-exam-page">Đang tải đề thi...</div>;
// //   if (!examInfo) return <div className="do-exam-page">Không tìm thấy đề thi</div>;

// //   // ========================
// //   // 🎉 Đã nộp bài
// //   // ========================
// //   if (submitted && result) {
// //     return (
// //       <div className="do-exam-page">
// //         <Navbar
// //           user={user}              // ⭐ THÊM
// //           onUpdateUser={onUpdateUser}  // ⭐ THÊM
// //           onLogout={onLogout}      // ⭐ THÊM
// //           onNavigateHome={onNavigateHome}
// //           onShowTeachers={onShowTeachers}
// //           onShowStudents={onShowStudents}
// //           onShowExamBank={onShowExamBank}
// //           onShowCreateExam={onShowCreateExam}
// //         />

// //         <div className="do-exam-container">
// //           <div className="result-card">
// //             <h1>🎉 Hoàn thành bài thi!</h1>
            
// //             <div className="score-display">
// //               <h2>Điểm: {result.score} / {result.totalPoints}</h2>
// //               <p className="percentage">({result.percentage}%)</p>
// //             </div>

// //             <div className="stats">
// //               <div className="stat-item">
// //                 <span className="label">✅ Đúng:</span>
// //                 <span className="value">{result.correct}</span>
// //               </div>
// //               <div className="stat-item">
// //                 <span className="label">❌ Sai:</span>
// //                 <span className="value">{result.wrong}</span>
// //               </div>
// //               <div className="stat-item">
// //                 <span className="label">⚠️ Chưa làm:</span>
// //                 <span className="value">{result.unanswered}</span>
// //               </div>
// //               <div className="stat-item">
// //                 <span className="label">🚨 Vi phạm:</span>
// //                 <span className="value">{result.totalViolations}</span>
// //               </div>
// //             </div>

// //             {result.totalViolations > 0 && (
// //               <div className="violation-details">
// //                 <h3>Chi tiết vi phạm:</h3>
// //                 <ul>
// //                   {Object.entries(result.violations).map(([type, count]) => (
// //                     <li key={type}>{type}: {count} lần</li>
// //                   ))}
// //                 </ul>
// //               </div>
// //             )}

// //             <button className="btn-home" onClick={onNavigateHome}>
// //               Về trang chủ
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // ========================
// //   // 📝 Đang thi
// //   // ========================
// //   return (
// //     <div ref={fullscreenRef} className="do-exam-page">
// //       <Navbar
// //         user={user}              // ⭐ THÊM
// //         onUpdateUser={onUpdateUser}  // ⭐ THÊM
// //         onLogout={onLogout}      // ⭐ THÊM
// //         onNavigateHome={onNavigateHome}
// //         onShowTeachers={onShowTeachers}
// //         onShowStudents={onShowStudents}
// //         onShowExamBank={onShowExamBank}
// //         onShowCreateExam={onShowCreateExam}
// //       />

// //       {/* ⏱️ Đồng hồ */}
// //       <div className="timer-floating">
// //         ⏳ {formatTime(timeLeft)}
// //         {violations.total > 0 && (
// //           <div className="violation-badge">
// //             🚨 {violations.total}/{settings.maxViolations}
// //           </div>
// //         )}
// //       </div>

// //       <div className="do-exam-container">
// //         <h1 className="exam-title">{examInfo.title}</h1>

// //         {/* ⚠️ Cảnh báo vi phạm */}
// //         {violations.total > 0 && violations.total < settings.maxViolations && (
// //           <div className="warning-banner">
// //             ⚠️ Cảnh báo: Bạn đã vi phạm {violations.total} lần. 
// //             Còn {settings.maxViolations - violations.total} lần trước khi tự động nộp bài!
// //           </div>
// //         )}

// //         <div className="question-list">
// //           {questions.map((q, index) => (
// //             <div className="question-card" key={q.id}>
// //               <p className="question-text">
// //                 <strong>Câu {index + 1}:</strong> {q.question_text} ({q.points} điểm)
// //               </p>

// //               <div className="choices">
// //                 {q.answers.length > 0 ? (
// //                   q.answers.map((a) => (
// //                     <label className="choice-item" key={a.id}>
// //                       <input
// //                         type="radio"
// //                         name={`q-${q.id}`}
// //                         value={a.id}
// //                         checked={answers[q.id] === a.id}
// //                         onChange={() => handleSelect(q.id, a.id)}
// //                         disabled={submitted}
// //                       />
// //                       <span>{a.answer_text}</span>
// //                     </label>
// //                   ))
// //                 ) : (
// //                   <p>❌ Chưa có đáp án</p>
// //                 )}
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <button className="submit-btn" onClick={() => handleSubmit(false)} disabled={submitted}>
// //           Nộp bài
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DoExamPage;

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./DoExamPage.css";

// const DoExamPage = ({
//   examId,
//   user,
//   onUpdateUser,
//   onLogout,
//   onNavigateHome,
//   onShowTeachers,
//   onShowStudents,
//   onShowExamBank,
//   onShowCreateExam,
// }) => {
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
  
//   const userId = user?.id;

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
//         // Không show error để không làm phiền user
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
//         // Update violations from server
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

//         // Allow limited retries
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
//         // Allow selection on input/textarea
//         if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
//           return;
//         }
//         e.preventDefault();
//       }
//     };

//     const handleKeyDown = (e) => {
//       // Block Ctrl+C, F12, Ctrl+Shift+I (DevTools)
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

//     // Confirmation if not forced
//     if (!isForced) {
//       const confirmed = window.confirm(
//         `Bạn có chắc muốn nộp bài?\n\n` +
//         `Đã làm: ${Object.keys(answers).length}/${questions.length} câu\n` +
//         `Thời gian còn lại: ${formatTime(timeLeft)}`
//       );
//       if (!confirmed) return;
//     }

//     setSubmitted(true);

//     // Stop heartbeat
//     if (heartbeatInterval.current) {
//       clearInterval(heartbeatInterval.current);
//     }

//     // Stop autosave
//     if (autoSaveInterval.current) {
//       clearInterval(autoSaveInterval.current);
//     }

//     // Exit fullscreen
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
        
//         // Clear saved answers
//         clearAnswersLocal();
        
//         showNotification("✅ Nộp bài thành công!", "success");
//       } else {
//         throw new Error(data.message || "Lỗi nộp bài");
//       }
//     } catch (error) {
//       console.error("❌ Submit error:", error);
//       setError("Lỗi kết nối khi nộp bài: " + error.message);
//       setSubmitted(false); // Allow retry
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
//     // Simple toast notification
//     // You can replace this with a proper toast library like react-toastify
//     console.log(`[${type.toUpperCase()}] ${message}`);
    
//     // For now, use alert for critical messages
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
//           user={user}
//           onUpdateUser={onUpdateUser}
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
//         user={user}
//         onUpdateUser={onUpdateUser}
//         onLogout={onLogout}
//         onNavigateHome={onNavigateHome}
//         onShowTeachers={onShowTeachers}
//         onShowStudents={onShowStudents}
//         onShowExamBank={onShowExamBank}
//         onShowCreateExam={onShowCreateExam}
//       />

//       {/* FULLSCREEN PROMPT */}
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

//       {/* KICKED OVERLAY */}
//       {kicked && (
//         <div className="kicked-overlay">
//           <div className="kicked-modal">
//             <h2>⚠️ Phiên thi đã kết thúc</h2>
//             <p>Bạn đã đăng nhập từ thiết bị khác hoặc vi phạm quá nhiều lần.</p>
//             <p>Bài thi đã được tự động nộp.</p>
//           </div>
//         </div>
//       )}

//       {/* TIMER */}
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

//         {/* WARNING BANNER */}
//         {violations.total > 0 && violations.total < (violations.max || settings.maxViolations) && (
//           <div className="warning-banner">
//             ⚠️ Cảnh báo: Bạn đã vi phạm {violations.total} lần. 
//             Còn {(violations.max || settings.maxViolations) - violations.total} lần trước khi tự động nộp bài!
//           </div>
//         )}

//         {/* QUESTIONS */}
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

//         {/* SUBMIT BUTTON */}
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

//Sửa lần 2
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
  // ✅ Lấy user từ AuthContext thay vì props
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

  // Refs
  const fullscreenRef = useRef(null);
  const heartbeatInterval = useRef(null);
  const autoSaveInterval = useRef(null);

  // ========================
  // CONFIG
  // ========================
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const HEARTBEAT_INTERVAL = 15000; // 15 seconds
  const AUTOSAVE_INTERVAL = 30000; // 30 seconds
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
  // 💾 AUTO-SAVE ANSWERS TO LOCALSTORAGE
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

  // Load saved answers
  const loadAnswersLocal = useCallback(() => {
    if (!examId || !userId) return null;
    
    const key = `exam_${examId}_user_${userId}_answers`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        // Check if saved within last 2 hours
        if (Date.now() - data.timestamp < 2 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (err) {
      console.error("❌ Load answers error:", err);
    }
    return null;
  }, [examId, userId]);

  // Clear saved answers
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
  }, [sessionStarted, submitted, saveAnswersLocal]);

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
          showNotification("⚠️ Phiên thi cũ của bạn đã bị đóng!", "warning");
        }

        // Start heartbeat
        startHeartbeat(data.sessionId);

        // Prompt for fullscreen
        if (settings.requireFullscreen) {
          setFullscreenReady(true);
        }

        // Load saved answers if any
        const saved = loadAnswersLocal();
        if (saved && saved.answers) {
          const shouldRestore = window.confirm(
            "Phát hiện bài làm đã lưu. Bạn có muốn tiếp tục bài làm trước đó không?"
          );
          if (shouldRestore) {
            setAnswers(saved.answers);
            showNotification("✅ Đã khôi phục bài làm trước đó", "success");
          }
        }
      } else {
        throw new Error(data.message || "Không thể bắt đầu thi");
      }
    } catch (error) {
      console.error("❌ Start session error:", error);
      setError("Lỗi kết nối server: " + error.message);
    }
  }, [userId, examId, sessionStarted, settings, getDeviceInfo, loadAnswersLocal]);

  // ========================
  // 💓 HEARTBEAT
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
            showNotification(
              "⚠️ Bạn đã đăng nhập từ thiết bị khác! Bài thi sẽ tự động nộp.",
              "error"
            );
            handleSubmit(true);
          }
        }
      } catch (error) {
        console.error("❌ Heartbeat error:", error);
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  // Cleanup heartbeat on unmount
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
          showNotification("🚫 Bạn đã vi phạm quá nhiều! Bài thi tự động nộp.", "error");
          handleSubmit(true);
        } else {
          showNotification(
            `⚠️ Vi phạm: ${type}. Còn ${data.maxViolations - data.violationCount} lần.`,
            "warning"
          );
        }
      }
    } catch (error) {
      console.error("❌ Log violation error:", error);
    }
  }, [sessionId, userId, examId, submitted, settings.maxViolations]);

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

        // Start session after exam loaded
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
  }, [examId, userId, onLogout, startSession]);

  // ========================
  // ⏱️ COUNTDOWN TIMER
  // ========================
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !sessionStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showNotification("⏰ Hết giờ! Tự động nộp bài.", "warning");
          handleSubmit(true);
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
            showNotification("⚠️ Vui lòng quay lại chế độ toàn màn hình!", "warning");
            setFullscreenReady(true);
            retryCount++;
          }, 1000);
        } else {
          showNotification("🚫 Thoát fullscreen quá nhiều lần!", "error");
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId, submitted, settings.requireFullscreen, logViolation]);

  // ========================
  // 🚫 BLOCK COPY/PASTE/RIGHT-CLICK
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
  // 🖼️ FULLSCREEN CONTROL
  // ========================
  const enterFullscreen = () => {
    if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
      fullscreenRef.current.requestFullscreen()
        .then(() => {
          setFullscreenReady(false);
          showNotification("✅ Đã vào chế độ toàn màn hình", "success");
        })
        .catch(err => {
          console.error("❌ Fullscreen error:", err);
          showNotification("❌ Không thể vào fullscreen. Trình duyệt không hỗ trợ.", "error");
          setFullscreenReady(false);
        });
    }
  };

  // ========================
  // ✅ SELECT ANSWER
  // ========================
  const handleSelect = useCallback((qid, value) => {
    if (submitted) return;
    setAnswers((prev) => {
      const newAnswers = { ...prev, [qid]: value };
      return newAnswers;
    });
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
        
        showNotification("✅ Nộp bài thành công!", "success");
      } else {
        throw new Error(data.message || "Lỗi nộp bài");
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      setError("Lỗi kết nối khi nộp bài: " + error.message);
      setSubmitted(false);
    }
  }, [submitted, answers, questions.length, timeLeft, sessionId, userId, examId, clearAnswersLocal]);

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

  const showNotification = (message, type = "info") => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    if (type === "error") {
      alert(message);
    }
  };

  // ========================
  // 🔄 LOADING STATE
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
  // ❌ ERROR STATE
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

  // ========================
  // 📋 NO EXAM FOUND
  // ========================
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