// import React, { useState, useEffect } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./CreateExamTracNghiem.css"; // Dùng chung file CSS
// import { API_URL } from "../config/api";

// // Component cho một câu hỏi trắc nghiệm đơn lẻ
// const QuestionCard = ({ question, index, onUpdate, onDelete }) => {
//   const handleAnswerChange = (e, answerIndex) => {
//     const newAnswers = question.answers.map((ans, i) =>
//       i === answerIndex ? { ...ans, text: e.target.value } : ans
//     );
//     onUpdate(index, { ...question, answers: newAnswers });
//   };

//   const handleCorrectChange = (e) => {
//     const newAnswers = question.answers.map((ans, i) => ({
//       ...ans,
//       isCorrect: i === parseInt(e.target.value),
//     }));
//     onUpdate(index, { ...question, answers: newAnswers });
//   };

//   return (
//     <div className="question-card">
//       <div className="card-header">
//         <label className="question-label">
//           Câu {index + 1}:
//           <textarea
//             value={question.text}
//             onChange={(e) => onUpdate(index, { ...question, text: e.target.value })}
//             placeholder="Nhập nội dung câu hỏi..."
//             rows="3"
//             required
//           />
//         </label>
//       </div>

//       <div className="card-body">
//         {question.answers.map((answer, answerIndex) => (
//           <div className="answer-option" key={answerIndex}>
//             <input
//               type="radio"
//               name={`correct-answer-${index}`}
//               value={answerIndex}
//               checked={answer.isCorrect}
//               onChange={handleCorrectChange}
//             />
//             <input
//               type="text"
//               value={answer.text}
//               onChange={(e) => handleAnswerChange(e, answerIndex)}
//               placeholder={`Lựa chọn ${String.fromCharCode(65 + answerIndex)}...`}
//               required
//             />
//           </div>
//         ))}
//       </div>

//       <div className="card-footer">
//         <button type="button" onClick={() => onDelete(index)} className="delete-q-btn">
//           🗑️ Xóa
//         </button>
//       </div>
//     </div>
//   );
// };

// // Component chính
// const CreateExamTracNghiem = ({ onNavigateHome, ...props }) => {
//   const [examInfo, setExamInfo] = useState({
//     title: "",
//     duration: "60",
//     numQuestions: "40",
//     tags: [],
//     currentTagInput: "",
//   });

//   const [questions, setQuestions] = useState([]);
//   const [step, setStep] = useState(1);

//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   // Chặn student truy cập
//   useEffect(() => {
//     if (role === "student") {
//       alert("⚠ Bạn không có quyền truy cập trang này!");
//       onNavigateHome();
//     }
//   }, [role, onNavigateHome]);

//   // --- STEP 1: Form thông tin cơ bản ---
//   const handleInfoChange = (e) => {
//     const { name, value } = e.target;
//     setExamInfo({ ...examInfo, [name]: value });
//   };

//   const handleInfoSubmit = (e) => {
//     e.preventDefault();
//     const initialQuestions = Array.from(
//       { length: parseInt(examInfo.numQuestions) || 1 },
//       () => ({
//         text: "",
//         answers: Array.from({ length: 4 }, () => ({ text: "", isCorrect: false })),
//       })
//     );
//     setQuestions(initialQuestions);
//     setStep(2);
//   };

//   // --- TAGS ---
//   const handleTagInput = (e) => setExamInfo({ ...examInfo, currentTagInput: e.target.value });

//   const handleTagKeyDown = (e) => {
//     if (["Enter", ",", "Tab"].includes(e.key)) {
//       e.preventDefault();
//       const newTag = examInfo.currentTagInput.trim().replace(/,$/, "");
//       if (newTag && !examInfo.tags.includes(newTag)) {
//         setExamInfo({ ...examInfo, tags: [...examInfo.tags, newTag], currentTagInput: "" });
//       }
//     }
//   };

//   const removeTag = (tagToRemove) =>
//     setExamInfo({ ...examInfo, tags: examInfo.tags.filter((t) => t !== tagToRemove) });

//   // --- STEP 2: Trình chỉnh sửa câu hỏi ---
//   const handleAddQuestion = () =>
//     setQuestions([
//       ...questions,
//       { text: "", answers: Array.from({ length: 4 }, () => ({ text: "", isCorrect: false })) },
//     ]);

//   const handleUpdateQuestion = (index, newQuestion) =>
//     setQuestions(questions.map((q, i) => (i === index ? newQuestion : q)));

//   const handleDeleteQuestion = (index) =>
//     setQuestions(questions.filter((_, i) => i !== index));

//   // --- Gửi dữ liệu lên server ---
//   const handleFinalSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       title: examInfo.title,
//       description: "",
//       duration: parseInt(examInfo.duration),
//       parts: 1,
//       questions: JSON.stringify(questions),
//       tags: examInfo.tags.join(","),
//     };

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";

//       const res = await fetch(`${apiUrl}/api/exams`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`, // gửi token
//         },
//         body: JSON.stringify(payload),
//       });

//       const text = await res.text();
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseErr) {
//         throw new Error("Server response không phải JSON: " + text);
//       }

//       if (!res.ok) {
//         throw new Error(data.message || `HTTP ${res.status}`);
//       }

//       alert(`Bài thi "${examInfo.title}" đã được lưu thành công với ${questions.length} câu hỏi!`);
//       onNavigateHome();
//     } catch (err) {
//       console.error("❌ Error:", err);

//       if (err.message === "Failed to fetch") {
//         alert(
//           "❌ Không thể kết nối Backend!\n\n" +
//             "Kiểm tra:\n" +
//             "• Backend có chạy? (cd backend && node server.js)\n" +
//             "• URL: ${API_URL}\n" +
//             "• CORS đã bật?"
//         );
//       } else {
//         alert("❌ Lỗi: " + err.message);
//       }
//     }
//   };

//   return (
//     <div className="exam-create-page">
//       <Navbar {...props} onNavigateHome={onNavigateHome} />

//       <div className="exam-create-container card-shadow">
//         <h1 className="exam-bank-title">
//           {step === 1 ? "📝 Tạo thông tin bài thi" : "📚 Trình chỉnh sửa câu hỏi"}
//         </h1>

//         {/* STEP 1 */}
//         {step === 1 && (
//           <form className="exam-form" onSubmit={handleInfoSubmit}>
//             <div className="form-group">
//               <label>Tên bài thi:</label>
//               <input
//                 type="text"
//                 name="title"
//                 value={examInfo.title}
//                 onChange={handleInfoChange}
//                 placeholder="Nhập tên bài thi..."
//                 required
//               />
//             </div>

//             <div className="form-group half-group">
//               <div style={{ flex: 1, marginRight: "10px" }}>
//                 <label>Thời gian làm bài (phút):</label>
//                 <input
//                   type="number"
//                   name="duration"
//                   value={examInfo.duration}
//                   onChange={handleInfoChange}
//                   placeholder="60 (phút)"
//                   required
//                 />
//               </div>
//               <div style={{ flex: 1 }}>
//                 <label>Số lượng câu hỏi (khởi tạo):</label>
//                 <input
//                   type="number"
//                   name="numQuestions"
//                   value={examInfo.numQuestions}
//                   onChange={handleInfoChange}
//                   placeholder="40 câu"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Thẻ (tags):</label>
//               <div className="tags-input-container">
//                 {examInfo.tags.map((tag) => (
//                   <span key={tag} className="tag-pill">
//                     {tag}
//                     <button type="button" onClick={() => removeTag(tag)}>
//                       ×
//                     </button>
//                   </span>
//                 ))}
//                 <input
//                   type="text"
//                   value={examInfo.currentTagInput}
//                   onChange={handleTagInput}
//                   onKeyDown={handleTagKeyDown}
//                   placeholder="Nhập thẻ (Toán, Lý, Hóa) và nhấn Enter/Phẩy"
//                 />
//               </div>
//             </div>

//             <div className="form-buttons">
//               <button type="submit" className="exam-detail-btn">
//                 ➡️ Tiếp tục tạo câu hỏi
//               </button>
//               <button type="button" className="exam-cancel-btn outline" onClick={onNavigateHome}>
//                 ⬅ Quay lại
//               </button>
//             </div>
//           </form>
//         )}

//         {/* STEP 2 */}
//         {step === 2 && (
//           <form className="exam-form question-editor" onSubmit={handleFinalSubmit}>
//             <p className="exam-summary">
//               **Bài thi:** {examInfo.title} | **Thời gian:** {examInfo.duration} phút | **Tags:**{" "}
//               {examInfo.tags.join(", ")}
//             </p>

//             <div className="question-list">
//               {questions.map((q, index) => (
//                 <QuestionCard
//                   key={index}
//                   question={q}
//                   index={index}
//                   onUpdate={handleUpdateQuestion}
//                   onDelete={handleDeleteQuestion}
//                 />
//               ))}
//             </div>

//             <button type="button" onClick={handleAddQuestion} className="add-q-btn">
//               ➕ Thêm câu hỏi mới
//             </button>

//             <div className="form-buttons final-buttons">
//               <button type="submit" className="exam-detail-btn">
//                 ✅ HOÀN TẤT & LƯU BÀI THI
//               </button>
//               <button type="button" className="exam-cancel-btn outline" onClick={() => setStep(1)}>
//                 <span style={{ color: "#E85A4F" }}>⚙ Quay lại chỉnh sửa thông tin</span>
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateExamTracNghiem;



import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./CreateExamTracNghiem.css";
import { API_URL } from "../config/api";
import useAuth from '../useAuth';

// Component cho một câu hỏi trắc nghiệm đơn lẻ
const QuestionCard = ({ question, index, onUpdate, onDelete }) => {
  const handleAnswerChange = (e, answerIndex) => {
    const newAnswers = question.answers.map((ans, i) =>
      i === answerIndex ? { ...ans, text: e.target.value } : ans
    );
    onUpdate(index, { ...question, answers: newAnswers });
  };

  const handleCorrectChange = (e) => {
    const newAnswers = question.answers.map((ans, i) => ({
      ...ans,
      isCorrect: i === parseInt(e.target.value),
    }));
    onUpdate(index, { ...question, answers: newAnswers });
  };

  return (
    <div className="question-card">
      <div className="card-header">
        <label className="question-label">
          Câu {index + 1}:
          <textarea
            value={question.text}
            onChange={(e) => onUpdate(index, { ...question, text: e.target.value })}
            placeholder="Nhập nội dung câu hỏi..."
            rows="3"
            required
          />
        </label>
      </div>

      <div className="card-body">
        {question.answers.map((answer, answerIndex) => (
          <div className="answer-option" key={answerIndex}>
            <input
              type="radio"
              name={`correct-answer-${index}`}
              value={answerIndex}
              checked={answer.isCorrect}
              onChange={handleCorrectChange}
            />
            <input
              type="text"
              value={answer.text}
              onChange={(e) => handleAnswerChange(e, answerIndex)}
              placeholder={`Lựa chọn ${String.fromCharCode(65 + answerIndex)}...`}
              required
            />
          </div>
        ))}
      </div>

      <div className="card-footer">
        <button type="button" onClick={() => onDelete(index)} className="delete-q-btn">
          🗑️ Xóa
        </button>
      </div>
    </div>
  );
};

// Component chính
const CreateExamTracNghiem = ({ 
  onLogout,
  onNavigateHome,
  onShowTeachers,
  onShowStudents,
  onShowExamBank,
  onShowCreateExam
}) => {
  // ✅ Lấy user từ AuthContext thay vì props
  const { currentUser, token } = useAuth();

  const [examInfo, setExamInfo] = useState({
    title: "",
    duration: "60",
    numQuestions: "40",
    tags: [],
    currentTagInput: "",
  });

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(1);

  // ✅ Chặn student truy cập - dùng currentUser từ AuthContext
  useEffect(() => {
    if (currentUser?.role === "student") {
      alert("⚠ Bạn không có quyền truy cập trang này!");
      onNavigateHome();
    }
  }, [currentUser, onNavigateHome]);

  // --- STEP 1: Form thông tin cơ bản ---
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setExamInfo({ ...examInfo, [name]: value });
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    const initialQuestions = Array.from(
      { length: parseInt(examInfo.numQuestions) || 1 },
      () => ({
        text: "",
        answers: Array.from({ length: 4 }, () => ({ text: "", isCorrect: false })),
      })
    );
    setQuestions(initialQuestions);
    setStep(2);
  };

  // --- TAGS ---
  const handleTagInput = (e) => setExamInfo({ ...examInfo, currentTagInput: e.target.value });

  const handleTagKeyDown = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      const newTag = examInfo.currentTagInput.trim().replace(/,$/, "");
      if (newTag && !examInfo.tags.includes(newTag)) {
        setExamInfo({ ...examInfo, tags: [...examInfo.tags, newTag], currentTagInput: "" });
      }
    }
  };

  const removeTag = (tagToRemove) =>
    setExamInfo({ ...examInfo, tags: examInfo.tags.filter((t) => t !== tagToRemove) });

  // --- STEP 2: Trình chỉnh sửa câu hỏi ---
  const handleAddQuestion = () =>
    setQuestions([
      ...questions,
      { text: "", answers: Array.from({ length: 4 }, () => ({ text: "", isCorrect: false })) },
    ]);

  const handleUpdateQuestion = (index, newQuestion) =>
    setQuestions(questions.map((q, i) => (i === index ? newQuestion : q)));

  const handleDeleteQuestion = (index) =>
    setQuestions(questions.filter((_, i) => i !== index));

  // --- Gửi dữ liệu lên server ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: examInfo.title,
      description: "",
      duration: parseInt(examInfo.duration),
      parts: 1,
      questions: JSON.stringify(questions),
      tags: examInfo.tags.join(","),
    };

    try {
      // ✅ Lấy token từ localStorage (đã có từ AuthContext)
      const authToken = localStorage.getItem('token');

      if (!authToken) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        if (onLogout) onLogout();
        return;
      }

      const res = await fetch(`${API_URL}/api/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, // ✅ gửi token
        },
        body: JSON.stringify(payload),
      });

      // ✅ Xử lý lỗi 401
      if (res.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        if (onLogout) onLogout();
        return;
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error("Server response không phải JSON: " + text);
      }

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      alert(`✅ Bài thi "${examInfo.title}" đã được lưu thành công với ${questions.length} câu hỏi!`);
      onNavigateHome();
    } catch (err) {
      console.error("❌ Error:", err);

      if (err.message === "Failed to fetch") {
        alert(
          "❌ Không thể kết nối Backend!\n\n" +
            "Kiểm tra:\n" +
            "• Backend có chạy? (cd backend && node server.js)\n" +
            `• URL: ${API_URL}\n` +
            "• CORS đã bật?"
        );
      } else {
        alert("❌ Lỗi: " + err.message);
      }
    }
  };

  return (
    <div className="exam-create-page">
      <Navbar 
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        onShowTeachers={onShowTeachers}
        onShowStudents={onShowStudents}
        onShowExamBank={onShowExamBank}
        onShowCreateExam={onShowCreateExam}
      />

      <div className="exam-create-container card-shadow">
        <h1 className="exam-bank-title">
          {step === 1 ? "📝 Tạo thông tin bài thi" : "📚 Trình chỉnh sửa câu hỏi"}
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <form className="exam-form" onSubmit={handleInfoSubmit}>
            <div className="form-group">
              <label>Tên bài thi:</label>
              <input
                type="text"
                name="title"
                value={examInfo.title}
                onChange={handleInfoChange}
                placeholder="Nhập tên bài thi..."
                required
              />
            </div>

            <div className="form-group half-group">
              <div style={{ flex: 1, marginRight: "10px" }}>
                <label>Thời gian làm bài (phút):</label>
                <input
                  type="number"
                  name="duration"
                  value={examInfo.duration}
                  onChange={handleInfoChange}
                  placeholder="60 (phút)"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Số lượng câu hỏi (khởi tạo):</label>
                <input
                  type="number"
                  name="numQuestions"
                  value={examInfo.numQuestions}
                  onChange={handleInfoChange}
                  placeholder="40 câu"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Thẻ (tags):</label>
              <div className="tags-input-container">
                {examInfo.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={examInfo.currentTagInput}
                  onChange={handleTagInput}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Nhập thẻ (Toán, Lý, Hóa) và nhấn Enter/Phẩy"
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="exam-detail-btn">
                ➡️ Tiếp tục tạo câu hỏi
              </button>
              <button type="button" className="exam-cancel-btn outline" onClick={onNavigateHome}>
                ⬅ Quay lại
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form className="exam-form question-editor" onSubmit={handleFinalSubmit}>
            <p className="exam-summary">
              **Bài thi:** {examInfo.title} | **Thời gian:** {examInfo.duration} phút | **Tags:**{" "}
              {examInfo.tags.join(", ")}
            </p>

            <div className="question-list">
              {questions.map((q, index) => (
                <QuestionCard
                  key={index}
                  question={q}
                  index={index}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>

            <button type="button" onClick={handleAddQuestion} className="add-q-btn">
              ➕ Thêm câu hỏi mới
            </button>

            <div className="form-buttons final-buttons">
              <button type="submit" className="exam-detail-btn">
                ✅ HOÀN TẤT & LƯU BÀI THI
              </button>
              <button type="button" className="exam-cancel-btn outline" onClick={() => setStep(1)}>
                <span style={{ color: "#E85A4F" }}>⚙ Quay lại chỉnh sửa thông tin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateExamTracNghiem;
