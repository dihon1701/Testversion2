import React, { useEffect, useState, useRef } from "react";
import Navbar from "../Navbar/Navbar";
import "./DoExamPage.css";
import { API_URL } from "../config/api";

const DoExamPage = ({
  examId,
  user,              // ⭐ THÊM
  onUpdateUser,      // ⭐ THÊM
  onLogout,          // ⭐ THÊM
  onNavigateHome,
  onShowTeachers,
  onShowStudents,
  onShowExamBank,
  onShowCreateExam,
}) => {
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // 🔒 Anti-cheat states
  const [sessionId, setSessionId] = useState(null);
  const [violations, setViolations] = useState({
    tabSwitch: 0,
    copyAttempt: 0,
    exitFullscreen: 0,
    total: 0
  });
  const [settings, setSettings] = useState({
    requireFullscreen: true,
    maxViolations: 3,
    blockCopy: true,
    blockRightClick: true
  });
  const [kicked, setKicked] = useState(false);

  const fullscreenRef = useRef(null);
  const heartbeatInterval = useRef(null);

  // ⭐ LẤY USER ID TỪ PROP
  const userId = user?.id || 3;

  const apiUrl = process.env.REACT_APP_API_URL || '${API_URL}';

  // ========================
  // 🔐 Lấy thông tin thiết bị
  // ========================
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  };

  // ========================
  // 🚀 Bắt đầu session
  // ========================
  const startSession = async () => {
    try {
      const deviceInfo = getDeviceInfo();

      const response = await fetch(`${apiUrl}/api/exam-session/start`, {
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
        console.log("✅ Session started:", data.sessionId);

        if (data.kicked) {
          alert("⚠️ Phiên thi cũ của bạn đã bị đóng!");
        }

        // Bắt đầu heartbeat
        startHeartbeat(data.sessionId);

        // Fullscreen nếu cần
        if (settings.requireFullscreen) {
          enterFullscreen();
        }
      } else {
        alert("❌ Không thể bắt đầu thi: " + data.message);
      }
    } catch (error) {
      console.error("❌ Start session error:", error);
      alert("Lỗi kết nối server!");
    }
  };

  // ========================
  // 💓 Heartbeat - Kiểm tra session
  // ========================
  const startHeartbeat = (sid) => {
    heartbeatInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/api/exam-session/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sid })
        });

        const data = await response.json();

        if (!data.valid) {
          console.log("❌ Session không valid:", data);
          setKicked(true);
          clearInterval(heartbeatInterval.current);
          
          if (data.kicked) {
            alert("⚠️ Bạn đã đăng nhập từ thiết bị khác! Bài thi sẽ bị nộp.");
            handleSubmit(true);
          }
        }
      } catch (error) {
        console.error("❌ Heartbeat error:", error);
      }
    }, 5000); // Mỗi 5 giây
  };

  // ========================
  // 🚨 Ghi log vi phạm
  // ========================
  const logViolation = async (type, detail) => {
    if (!sessionId || submitted) return;

    try {
      const response = await fetch(`${apiUrl}/api/exam-session/violation`, {
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

      if (data.forceEnd) {
        alert("🚫 Bạn đã vi phạm quá nhiều! Bài thi sẽ tự động nộp.");
        handleSubmit(true);
      }
    } catch (error) {
      console.error("❌ Log violation error:", error);
    }
  };

  // ========================
  // 📋 Fetch đề thi
  // ========================
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching exam ID:', examId);

        // ⭐ THÊM TOKEN
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('❌ No token found!');
          alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          if (onLogout) onLogout();
          return;
        }

        const res = await fetch(`${apiUrl}/api/exams/${examId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,  // ⭐ THÊM TOKEN
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Response status:', res.status);

        if (res.status === 401) {
          alert('Phiên đăng nhập hết hạn!');
          if (onLogout) onLogout();
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

        // Bắt đầu session sau khi load xong
        await startSession();
      } catch (err) {
        console.error("❌ Fetch exam error:", err);
        alert("Lỗi: " + err.message);
        setExamInfo(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }

    return () => {
      // Cleanup heartbeat khi unmount
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [examId]);

  // ========================
  // ⏱️ Đếm ngược thời gian
  // ========================
  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Hết giờ = force submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ========================
  // 🔍 Phát hiện chuyển tab
  // ========================
  useEffect(() => {
    if (!sessionId || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({
          ...prev,
          tabSwitch: prev.tabSwitch + 1,
          total: prev.total + 1
        }));
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
  }, [sessionId, submitted]);

  // ========================
  // 🖥️ Phát hiện thoát fullscreen
  // ========================
  useEffect(() => {
    if (!sessionId || submitted || !settings.requireFullscreen) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations(prev => ({
          ...prev,
          exitFullscreen: prev.exitFullscreen + 1,
          total: prev.total + 1
        }));
        logViolation("EXIT_FULLSCREEN", "Thoát chế độ toàn màn hình");

        // Yêu cầu vào lại
        setTimeout(() => {
          if (!submitted) {
            enterFullscreen();
          }
        }, 1000);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [sessionId, submitted, settings.requireFullscreen]);

  // ========================
  // 🚫 Chặn copy, right-click, shortcuts
  // ========================
  useEffect(() => {
    if (!sessionId || submitted) return;

    const handleCopy = (e) => {
      if (settings.blockCopy) {
        e.preventDefault();
        setViolations(prev => ({
          ...prev,
          copyAttempt: prev.copyAttempt + 1,
          total: prev.total + 1
        }));
        logViolation("COPY_ATTEMPT", "Cố gắng copy nội dung");
      }
    };

    const handleContextMenu = (e) => {
      if (settings.blockRightClick) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e) => {
      if (settings.blockCopy) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      // Chặn Ctrl+C, Ctrl+A, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "a")) ||
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
  }, [sessionId, submitted, settings]);

  // ========================
  // 🖼️ Fullscreen
  // ========================
  const enterFullscreen = () => {
    if (fullscreenRef.current && fullscreenRef.current.requestFullscreen) {
      fullscreenRef.current.requestFullscreen().catch(err => {
        console.error("❌ Fullscreen error:", err);
      });
    }
  };

  // ========================
  // ✅ Chọn đáp án
  // ========================
  const handleSelect = (qid, value) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  // ========================
  // 📤 Nộp bài
  // ========================
  const handleSubmit = async (isForced = false) => {
    if (submitted) return;

    setSubmitted(true);

    // Stop heartbeat
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    // Thoát fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    try {
      const response = await fetch(`${apiUrl}/api/exam-session/submit`, {
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
        console.log("✅ Nộp bài thành công:", data.result);
      } else {
        alert("❌ Lỗi nộp bài: " + data.message);
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      alert("Lỗi kết nối server khi nộp bài!");
    }
  };

  // ========================
  // 🎨 Format time
  // ========================
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ========================
  // 🔄 Loading
  // ========================
  if (loading) return <div className="do-exam-page">Đang tải đề thi...</div>;
  if (!examInfo) return <div className="do-exam-page">Không tìm thấy đề thi</div>;

  // ========================
  // 🎉 Đã nộp bài
  // ========================
  if (submitted && result) {
    return (
      <div className="do-exam-page">
        <Navbar
          user={user}              // ⭐ THÊM
          onUpdateUser={onUpdateUser}  // ⭐ THÊM
          onLogout={onLogout}      // ⭐ THÊM
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
  // 📝 Đang thi
  // ========================
  return (
    <div ref={fullscreenRef} className="do-exam-page">
      <Navbar
        user={user}              // ⭐ THÊM
        onUpdateUser={onUpdateUser}  // ⭐ THÊM
        onLogout={onLogout}      // ⭐ THÊM
        onNavigateHome={onNavigateHome}
        onShowTeachers={onShowTeachers}
        onShowStudents={onShowStudents}
        onShowExamBank={onShowExamBank}
        onShowCreateExam={onShowCreateExam}
      />

      {/* ⏱️ Đồng hồ */}
      <div className="timer-floating">
        ⏳ {formatTime(timeLeft)}
        {violations.total > 0 && (
          <div className="violation-badge">
            🚨 {violations.total}/{settings.maxViolations}
          </div>
        )}
      </div>

      <div className="do-exam-container">
        <h1 className="exam-title">{examInfo.title}</h1>

        {/* ⚠️ Cảnh báo vi phạm */}
        {violations.total > 0 && violations.total < settings.maxViolations && (
          <div className="warning-banner">
            ⚠️ Cảnh báo: Bạn đã vi phạm {violations.total} lần. 
            Còn {settings.maxViolations - violations.total} lần trước khi tự động nộp bài!
          </div>
        )}

        <div className="question-list">
          {questions.map((q, index) => (
            <div className="question-card" key={q.id}>
              <p className="question-text">
                <strong>Câu {index + 1}:</strong> {q.question_text} ({q.points} điểm)
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
                  <p>❌ Chưa có đáp án</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="submit-btn" onClick={() => handleSubmit(false)} disabled={submitted}>
          Nộp bài
        </button>
      </div>
    </div>
  );
};

export default DoExamPage;