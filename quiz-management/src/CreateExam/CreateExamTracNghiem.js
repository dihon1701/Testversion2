// import React, { useState } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./CreateExamTracNghiem.css"; // Dùng chung file CSS

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
//     tags: [], // Tags giờ là một mảng
//     currentTagInput: "", // Input tạm thời cho Tags
//   });
//   const [questions, setQuestions] = useState([]);
//   const [step, setStep] = useState(1); // 1: Info Form, 2: Question Editor

//   // --- LOGIC CHO FORM THÔNG TIN BAN ĐẦU (STEP 1) ---
//   const handleInfoChange = (e) => {
//     const { name, value } = e.target;
//     setExamInfo({ ...examInfo, [name]: value });
//   };

//   const handleInfoSubmit = (e) => {
//     e.preventDefault();
//     // Khởi tạo số lượng câu hỏi rỗng
//     const initialQuestions = Array.from({ length: parseInt(examInfo.numQuestions) || 1 }, () => ({
//       text: "",
//       answers: [
//         { text: "", isCorrect: false },
//         { text: "", isCorrect: false },
//         { text: "", isCorrect: false },
//         { text: "", isCorrect: false },
//       ],
//     }));
//     setQuestions(initialQuestions);
//     setStep(2); // Chuyển sang Giai đoạn 2: Tạo Câu hỏi
//   };

//   // --- LOGIC CHO TAGS (PILL UI) ---
//   const handleTagInput = (e) => {
//     setExamInfo({ ...examInfo, currentTagInput: e.target.value });
//   };

//   const handleTagKeyDown = (e) => {
//     if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
//       e.preventDefault();
//       const newTag = examInfo.currentTagInput.trim().replace(/,$/, "");
//       if (newTag && !examInfo.tags.includes(newTag)) {
//         setExamInfo({
//           ...examInfo,
//           tags: [...examInfo.tags, newTag],
//           currentTagInput: "",
//         });
//       }
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     setExamInfo({
//       ...examInfo,
//       tags: examInfo.tags.filter((tag) => tag !== tagToRemove),
//     });
//   };

//   // --- LOGIC CHO TRÌNH CHỈNH SỬA CÂU HỎI (STEP 2) ---
//   const handleAddQuestion = () => {
//     setQuestions([
//       ...questions,
//       {
//         text: "",
//         answers: [
//           { text: "", isCorrect: false },
//           { text: "", isCorrect: false },
//           { text: "", isCorrect: false },
//           { text: "", isCorrect: false },
//         ],
//       },
//     ]);
//   };

//   const handleUpdateQuestion = (index, newQuestion) => {
//     const updatedQuestions = questions.map((q, i) =>
//       i === index ? newQuestion : q
//     );
//     setQuestions(updatedQuestions);
//   };

//   const handleDeleteQuestion = (index) => {
//     const updatedQuestions = questions.filter((_, i) => i !== index);
//     setQuestions(updatedQuestions);
//   };

//   const handleFinalSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       title: examInfo.title,
//       duration: examInfo.duration,
//       tags: examInfo.tags,
//       questions: questions,
//     };

//     try {
//       const res = await fetch("${API_URL}/api/exams", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert("❌ Lỗi lưu bài thi: " + data.message);
//         return;
//       }

//       alert("✔️ Bài thi đã được lưu vào database!");

//       // Chuyển về Ngân hàng đề hoặc Home
//       onNavigateHome(); 
//     } catch (error) {
//       console.error("Lỗi:", error);
//       alert("❌ Không thể kết nối server!");
//     }
//   };
  
//   // --- RENDERING DỰA TRÊN STEP ---
//   return (
//     <div className="exam-create-page">
//       <Navbar {...props} onNavigateHome={onNavigateHome} />

//       <div className="exam-create-container card-shadow"> 
//         <h1 className="exam-bank-title">
//           {step === 1 ? "📝 Tạo thông tin bài thi" : "📚 Trình chỉnh sửa câu hỏi"}
//         </h1>
        
//         {/* STEP 1: Form thông tin cơ bản */}
//         {step === 1 && (
//           <form className="exam-form" onSubmit={handleInfoSubmit}>
//             <div className="form-group">
//               <label>Tên bài thi:</label>
//               <input type="text" name="title" value={examInfo.title} onChange={handleInfoChange} placeholder="Nhập tên bài thi..." required />
//             </div>

//             <div className="form-group half-group">
//               <div style={{ flex: 1, marginRight: '10px' }}>
//                   <label>Thời gian làm bài (phút):</label>
//                   <input type="number" name="duration" value={examInfo.duration} onChange={handleInfoChange} placeholder="60 (phút)" required />
//               </div>
//               <div style={{ flex: 1 }}>
//                   <label>Số lượng câu hỏi (khởi tạo):</label>
//                   <input type="number" name="numQuestions" value={examInfo.numQuestions} onChange={handleInfoChange} placeholder="40 câu" required />
//               </div>
//             </div>

//             {/* TAGS UI - Cải tiến */}
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
//                   name="currentTagInput"
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

//         {/* STEP 2: Trình chỉnh sửa câu hỏi (Giống Google Forms) */}
//         {step === 2 && (
//           <form className="exam-form question-editor" onSubmit={handleFinalSubmit}>
//             <p className="exam-summary">
//                 **Bài thi:** {examInfo.title} | **Thời gian:** {examInfo.duration} phút | **Tags:** {examInfo.tags.join(', ')}
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
//                 <span style={{color: '#E85A4F'}}>⚙ Quay lại chỉnh sửa thông tin</span>
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateExamTracNghiem;


// import React, { useState } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./CreateExamTracNghiem.css"; // Dùng chung file CSS

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

//   const handleInfoChange = (e) => {
//     const { name, value } = e.target;
//     setExamInfo({ ...examInfo, [name]: value });
//   };

//   const handleInfoSubmit = (e) => {
//     e.preventDefault();
//     const initialQuestions = Array.from({ length: parseInt(examInfo.numQuestions) || 1 }, () => ({
//       text: "",
//       answers: Array(4).fill({ text: "", isCorrect: false }),
//     }));
//     setQuestions(initialQuestions);
//     setStep(2);
//   };

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
//   const removeTag = (tagToRemove) => setExamInfo({ ...examInfo, tags: examInfo.tags.filter((t) => t !== tagToRemove) });

//   const handleAddQuestion = () => setQuestions([...questions, { text: "", answers: Array(4).fill({ text: "", isCorrect: false }) }]);
//   const handleUpdateQuestion = (index, newQuestion) => setQuestions(questions.map((q, i) => (i === index ? newQuestion : q)));
//   const handleDeleteQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

//   const handleFinalSubmit = async (e) => {
//     e.preventDefault();

//     const payload = { ...examInfo, questions };
//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_URL}/api/exams`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Lưu bài thi thất bại!");
//       const data = await res.json();
//       alert(`Bài thi "${data.title}" đã được lưu thành công với ${questions.length} câu hỏi!`);
//       onNavigateHome();
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="exam-create-page">
//       <Navbar {...props} onNavigateHome={onNavigateHome} />
//       <div className="exam-create-container card-shadow">
//         <h1 className="exam-bank-title">{step === 1 ? "📝 Tạo thông tin bài thi" : "📚 Trình chỉnh sửa câu hỏi"}</h1>

//         {step === 1 && (
//           <form className="exam-form" onSubmit={handleInfoSubmit}>
//             <div className="form-group">
//               <label>Tên bài thi:</label>
//               <input type="text" name="title" value={examInfo.title} onChange={handleInfoChange} placeholder="Nhập tên bài thi..." required />
//             </div>

//             <div className="form-group half-group">
//               <div style={{ flex: 1, marginRight: '10px' }}>
//                 <label>Thời gian làm bài (phút):</label>
//                 <input type="number" name="duration" value={examInfo.duration} onChange={handleInfoChange} placeholder="60 (phút)" required />
//               </div>
//               <div style={{ flex: 1 }}>
//                 <label>Số lượng câu hỏi (khởi tạo):</label>
//                 <input type="number" name="numQuestions" value={examInfo.numQuestions} onChange={handleInfoChange} placeholder="40 câu" required />
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Thẻ (tags):</label>
//               <div className="tags-input-container">
//                 {examInfo.tags.map((tag) => (
//                   <span key={tag} className="tag-pill">
//                     {tag}
//                     <button type="button" onClick={() => removeTag(tag)}>×</button>
//                   </span>
//                 ))}
//                 <input type="text" value={examInfo.currentTagInput} onChange={handleTagInput} onKeyDown={handleTagKeyDown} placeholder="Nhập thẻ và nhấn Enter/Phẩy" />
//               </div>
//             </div>

//             <div className="form-buttons">
//               <button type="submit" className="exam-detail-btn">➡️ Tiếp tục tạo câu hỏi</button>
//               <button type="button" className="exam-cancel-btn outline" onClick={onNavigateHome}>⬅ Quay lại</button>
//             </div>
//           </form>
//         )}

//         {step === 2 && (
//           <form className="exam-form question-editor" onSubmit={handleFinalSubmit}>
//             <p className="exam-summary">**Bài thi:** {examInfo.title} | **Thời gian:** {examInfo.duration} phút | **Tags:** {examInfo.tags.join(', ')}</p>
//             <div className="question-list">
//               {questions.map((q, index) => (
//                 <QuestionCard key={index} question={q} index={index} onUpdate={handleUpdateQuestion} onDelete={handleDeleteQuestion} />
//               ))}
//             </div>

//             <button type="button" onClick={handleAddQuestion} className="add-q-btn">➕ Thêm câu hỏi mới</button>

//             <div className="form-buttons final-buttons">
//               <button type="submit" className="exam-detail-btn">✅ HOÀN TẤT & LƯU BÀI THI</button>
//               <button type="button" className="exam-cancel-btn outline" onClick={() => setStep(1)}>
//                 <span style={{ color: '#E85A4F' }}>⚙ Quay lại chỉnh sửa thông tin</span>
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateExamTracNghiem;


// import React, { useState, useEffect } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./CreateExamTracNghiem.css"; // Dùng chung file CSS

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

//   // --- STEP 1: Form thông tin cơ bản ---
//   const handleInfoChange = (e) => {
//     const { name, value } = e.target;
//     setExamInfo({ ...examInfo, [name]: value });
//   };

//   const handleInfoSubmit = (e) => {
//     e.preventDefault();
//     const initialQuestions = Array.from({ length: parseInt(examInfo.numQuestions) || 1 }, () => ({
//       text: "",
//       answers: Array.from({ length: 4 }, () => ({ text: "", isCorrect: false })),
//     }));
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

//   const removeTag = (tagToRemove) => setExamInfo({ ...examInfo, tags: examInfo.tags.filter((t) => t !== tagToRemove) });

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
//       description: "",  // ✅ Thêm description
//       duration: parseInt(examInfo.duration),  // ✅ Chuyển thành số
//       parts: 1,
//       questions: JSON.stringify(questions),
//       tags: examInfo.tags.join(","),  // ✅ Chuyển array thành string: "toán,lý"
//     };

//     console.log("📤 Sending payload:", payload);

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       console.log("🌐 API URL:", apiUrl);

//       const res = await fetch(`${apiUrl}/api/exams`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       console.log("📥 Response status:", res.status);

//       const text = await res.text();
//       console.log("📥 Response text:", text);

//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (parseErr) {
//         throw new Error("Server response không phải JSON: " + text);
//       }

//       if (!res.ok) {
//         throw new Error(data.message || `HTTP ${res.status}`);
//       }

//       console.log("✅ Success:", data);
//       alert(`Bài thi "${examInfo.title}" đã được lưu thành công với ${questions.length} câu hỏi!`);
//       onNavigateHome();
//     } catch (err) {
//       console.error("❌ Error:", err);
      
//       if (err.message === "Failed to fetch") {
//         alert(
//           "❌ Không thể kết nối Backend!\n\n" +
//           "Kiểm tra:\n" +
//           "• Backend có chạy? (cd backend && node server.js)\n" +
//           "• URL: ${API_URL}\n" +
//           "• CORS đã bật?"
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
import "./CreateExamTracNghiem.css"; // Dùng chung file CSS
import { API_URL } from "./config/api";

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
const CreateExamTracNghiem = ({ onNavigateHome, ...props }) => {
  const [examInfo, setExamInfo] = useState({
    title: "",
    duration: "60",
    numQuestions: "40",
    tags: [],
    currentTagInput: "",
  });

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(1);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Chặn student truy cập
  useEffect(() => {
    if (role === "student") {
      alert("⚠ Bạn không có quyền truy cập trang này!");
      onNavigateHome();
    }
  }, [role, onNavigateHome]);

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
      const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";

      const res = await fetch(`${apiUrl}/api/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // gửi token
        },
        body: JSON.stringify(payload),
      });

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

      alert(`Bài thi "${examInfo.title}" đã được lưu thành công với ${questions.length} câu hỏi!`);
      onNavigateHome();
    } catch (err) {
      console.error("❌ Error:", err);

      if (err.message === "Failed to fetch") {
        alert(
          "❌ Không thể kết nối Backend!\n\n" +
            "Kiểm tra:\n" +
            "• Backend có chạy? (cd backend && node server.js)\n" +
            "• URL: ${API_URL}\n" +
            "• CORS đã bật?"
        );
      } else {
        alert("❌ Lỗi: " + err.message);
      }
    }
  };

  return (
    <div className="exam-create-page">
      <Navbar {...props} onNavigateHome={onNavigateHome} />

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
