// import React, { useState, useEffect } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./ExamBank.css";
// import { LuClock3, LuUsers, LuMessageSquare, LuTrash2 } from "react-icons/lu";

// const ExamBankTracNghiem = ({
//   onNavigateHome,
//   onShowTeachers,
//   onShowStudents,
//   onShowExamBank,
//   onShowCreateExam,
//   onDoExam,
//   currentUser, // object { id, username, role_name }
//   token,       // JWT token
// }) => {
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // =========================
//   // Fetch danh sách đề thi
//   // =========================
//   const fetchExams = async () => {
//     setLoading(true);
//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//       const result = await res.json();
//       const examsData = result.data || result;

//       const parsed = examsData.map((exam) => ({
//         ...exam,
//         tags: typeof exam.tags === "string" ? exam.tags.split(",").filter(Boolean) : [],
//         attempts: exam.attempts || 0,
//         comments: exam.comments || 0,
//       }));

//       setExams(parsed);
//     } catch (err) {
//       console.error("❌ Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   // =========================
//   // Xem chi tiết bài thi
//   // =========================
//   const handleDetail = (exam) => {
//     onDoExam(exam.id);
//   };

//   // =========================
//   // Xóa đề thi
//   // =========================
//   const handleDelete = async (examId) => {
//     if (!window.confirm("⚠️ Bạn có chắc muốn xóa đề thi này?")) return;

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams/${examId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

//       alert(`✅ ${data.message}`);
//       fetchExams(); // Reload danh sách
//     } catch (err) {
//       console.error("❌ Delete error:", err);
//       alert("❌ Lỗi khi xóa đề: " + err.message);
//     }
//   };

//   if (loading) return <div className="exam-bank-page">Đang tải danh sách đề...</div>;
//   if (error) return <div className="exam-bank-page">Lỗi: {error}</div>;

//   return (
//     <div className="exam-bank-page">
//       <Navbar
//         onNavigateHome={onNavigateHome}
//         onShowTeachers={onShowTeachers}
//         onShowStudents={onShowStudents}
//         onShowExamBank={onShowExamBank}
//         onShowCreateExam={onShowCreateExam}
//       />

//       <div className="exam-bank-container">
//         <h1 className="exam-bank-title">Ngân hàng đề – Trắc nghiệm</h1>

//         <div className="exam-grid">
//           {exams.map((e) => (
//             <div key={e.id} className="exam-card">
//               <div className="exam-card-body">
//                 <h3 className="exam-title">{e.title}</h3>

//                 <div className="exam-meta-row">
//                   <span className="exam-meta"><LuClock3 /> {e.duration} phút</span>
//                   <span className="exam-sep">|</span>
//                   <span className="exam-meta"><LuUsers /> {e.attempts.toLocaleString()}</span>
//                   <span className="exam-sep">|</span>
//                   <span className="exam-meta"><LuMessageSquare /> {e.comments.toLocaleString()}</span>
//                 </div>

//                 <p className="exam-sub">{e.parts} phần thi | {e.questions} câu hỏi</p>

//                 <div className="exam-tags">
//                   {e.tags.map((t, i) => (<span key={i} className="exam-tag">#{t}</span>))}
//                 </div>
//               </div>

//               <div className="exam-card-footer">
//                 <button className="exam-detail-btn" onClick={() => handleDetail(e)}>
//                   Chi tiết
//                 </button>

//                 {/* Nút Xóa chỉ hiển thị với Admin hoặc Teacher */}
//                 {(currentUser?.role_name === "admin" || currentUser?.role_name === "teacher") && (
//                   <button
//                     className="exam-delete-btn"
//                     onClick={() => handleDelete(e.id)}
//                     style={{ marginLeft: "10px", backgroundColor: "#E85A4F", color: "#fff" }}
//                   >
//                     <LuTrash2 /> Xóa
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExamBankTracNghiem;


// import React, { useState, useEffect } from "react";
// import Navbar from "../Navbar/Navbar";
// import "./ExamBank.css";
// import { LuClock3, LuUsers, LuMessageSquare, LuTrash2, LuPencil } from "react-icons/lu";

// const ExamBankTracNghiem = ({
//   onNavigateHome,
//   onShowTeachers,
//   onShowStudents,
//   onShowExamBank,
//   onShowCreateExam,
//   onDoExam,
//   currentUser,
//   token,
// }) => {

//   // 👇 THÊM DÒNG NÀY
//   console.log("🔍 DEBUG currentUser:", currentUser);
//   console.log("🔍 DEBUG role_name:", currentUser?.role_name);
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // State cho modal chỉnh sửa
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingExam, setEditingExam] = useState(null);
//   const [editForm, setEditForm] = useState({
//     title: "",
//     description: "",
//     duration: 60,
//     parts: 1,
//     tags: "",
//   });

//   // =========================
//   // Fetch danh sách đề thi
//   // =========================
//   const fetchExams = async () => {
//     setLoading(true);
//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//       const result = await res.json();
//       const examsData = result.data || result;

//       const parsed = examsData.map((exam) => ({
//         ...exam,
//         tags: typeof exam.tags === "string" ? exam.tags.split(",").filter(Boolean) : [],
//         attempts: exam.attempts || 0,
//         comments: exam.comments || 0,
//       }));

//       setExams(parsed);
//     } catch (err) {
//       console.error("❌ Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   // =========================
//   // Xem chi tiết bài thi
//   // =========================
//   const handleDetail = (exam) => {
//     onDoExam(exam.id);
//   };

//   // =========================
//   // Xóa đề thi
//   // =========================
//   const handleDelete = async (examId) => {
//     if (!window.confirm("⚠️ Bạn có chắc muốn xóa đề thi này? Hành động này không thể hoàn tác!")) return;

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams/${examId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

//       alert(`✅ ${data.message}`);
//       fetchExams(); // Reload danh sách
//     } catch (err) {
//       console.error("❌ Delete error:", err);
//       alert("❌ Lỗi khi xóa đề: " + err.message);
//     }
//   };

//   // =========================
//   // Mở modal chỉnh sửa
//   // =========================
//   const handleEdit = async (exam) => {
//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams/${exam.id}/full`);
      
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
//       const data = await res.json();
      
//       setEditingExam(data.exam);
//       setEditForm({
//         title: data.exam.title || "",
//         description: data.exam.description || "",
//         duration: data.exam.duration || 60,
//         parts: data.exam.parts || 1,
//         tags: data.exam.tags || "",
//       });
//       setShowEditModal(true);
//     } catch (err) {
//       console.error("❌ Fetch exam error:", err);
//       alert("❌ Lỗi khi tải thông tin đề thi: " + err.message);
//     }
//   };

//   // =========================
//   // Đóng modal
//   // =========================
//   const handleCloseModal = () => {
//     setShowEditModal(false);
//     setEditingExam(null);
//     setEditForm({
//       title: "",
//       description: "",
//       duration: 60,
//       parts: 1,
//       tags: "",
//     });
//   };

//   // =========================
//   // Thay đổi giá trị form
//   // =========================
//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // =========================
//   // Lưu chỉnh sửa
//   // =========================
//   const handleSaveEdit = async (e) => {
//     e.preventDefault();

//     if (!editForm.title.trim()) {
//       alert("⚠️ Vui lòng nhập tên đề thi!");
//       return;
//     }

//     if (editForm.duration <= 0) {
//       alert("⚠️ Thời gian thi phải lớn hơn 0!");
//       return;
//     }

//     try {
//       const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";
//       const res = await fetch(`${apiUrl}/api/exams/${editingExam.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(editForm),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

//       alert(`✅ ${data.message}`);
//       handleCloseModal();
//       fetchExams(); // Reload danh sách
//     } catch (err) {
//       console.error("❌ Update error:", err);
//       alert("❌ Lỗi khi cập nhật đề: " + err.message);
//     }
//   };

//   if (loading) return <div className="exam-bank-page">Đang tải danh sách đề...</div>;
//   if (error) return <div className="exam-bank-page">Lỗi: {error}</div>;

//   return (
//     <div className="exam-bank-page">
//       <Navbar
//         onNavigateHome={onNavigateHome}
//         onShowTeachers={onShowTeachers}
//         onShowStudents={onShowStudents}
//         onShowExamBank={onShowExamBank}
//         onShowCreateExam={onShowCreateExam}
//       />

//       <div className="exam-bank-container">
//         <h1 className="exam-bank-title">Ngân hàng đề – Trắc nghiệm</h1>

//         <div className="exam-grid">
//           {exams.map((e) => (
//             <div key={e.id} className="exam-card">
//               <div className="exam-card-body">
//                 <h3 className="exam-title">{e.title}</h3>

//                 <div className="exam-meta-row">
//                   <span className="exam-meta"><LuClock3 /> {e.duration} phút</span>
//                   <span className="exam-sep">|</span>
//                   <span className="exam-meta"><LuUsers /> {e.attempts.toLocaleString()}</span>
//                   <span className="exam-sep">|</span>
//                   <span className="exam-meta"><LuMessageSquare /> {e.comments.toLocaleString()}</span>
//                 </div>

//                 <p className="exam-sub">{e.parts} phần thi | {e.questions} câu hỏi</p>

//                 <div className="exam-tags">
//                   {e.tags.map((t, i) => (<span key={i} className="exam-tag">#{t}</span>))}
//                 </div>
//               </div>

//               <div className="exam-card-footer">
//                 <button className="exam-detail-btn" onClick={() => handleDetail(e)}>
//                   Chi tiết
//                 </button>

//                 {/* Nút Chỉnh sửa và Xóa chỉ hiển thị với Admin hoặc Teacher */}
//                 {(currentUser?.role_name === "admin" || currentUser?.role_name === "teacher") && (
//                   <>
//                     <button
//                       className="exam-edit-btn"
//                       onClick={() => handleEdit(e)}
//                       title="Chỉnh sửa đề thi"
//                     >
//                       <LuPencil /> Sửa
//                     </button>

//                     <button
//                       className="exam-delete-btn"
//                       onClick={() => handleDelete(e.id)}
//                       title="Xóa đề thi"
//                     >
//                       <LuTrash2 /> Xóa
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modal chỉnh sửa đề thi */}
//       {showEditModal && (
//         <div className="edit-modal-overlay" onClick={handleCloseModal}>
//           <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="edit-modal-header">
//               <h2>✏️ Chỉnh sửa đề thi</h2>
//               <button className="edit-modal-close" onClick={handleCloseModal}>
//                 ×
//               </button>
//             </div>

//             <form className="edit-modal-form" onSubmit={handleSaveEdit}>
//               <div className="form-group">
//                 <label htmlFor="title">Tên đề thi *</label>
//                 <input
//                   type="text"
//                   id="title"
//                   name="title"
//                   value={editForm.title}
//                   onChange={handleFormChange}
//                   placeholder="Nhập tên đề thi"
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="description">Mô tả</label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   value={editForm.description}
//                   onChange={handleFormChange}
//                   placeholder="Nhập mô tả chi tiết về đề thi"
//                   rows="4"
//                 />
//               </div>

//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="duration">Thời gian (phút) *</label>
//                   <input
//                     type="number"
//                     id="duration"
//                     name="duration"
//                     value={editForm.duration}
//                     onChange={handleFormChange}
//                     min="1"
//                     required
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label htmlFor="parts">Số phần thi</label>
//                   <input
//                     type="number"
//                     id="parts"
//                     name="parts"
//                     value={editForm.parts}
//                     onChange={handleFormChange}
//                     min="1"
//                   />
//                 </div>
//               </div>

//               <div className="form-group">
//                 <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
//                 <input
//                   type="text"
//                   id="tags"
//                   name="tags"
//                   value={editForm.tags}
//                   onChange={handleFormChange}
//                   placeholder="VD: toán,lớp10,khó"
//                 />
//               </div>

//               <div className="edit-modal-footer">
//                 <button type="button" className="btn-cancel" onClick={handleCloseModal}>
//                   Hủy
//                 </button>
//                 <button type="submit" className="btn-save">
//                   💾 Lưu thay đổi
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExamBankTracNghiem;


import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import "./ExamBank.css";
import { LuClock3, LuUsers, LuMessageSquare, LuTrash2, LuPencil, LuPlus, LuCheck, LuX } from "react-icons/lu";
import { API_URL } from "./config/api";

const ExamBankTracNghiem = ({
  user,              // ⭐ THÊM: nhận user từ App.js
  onUpdateUser,      // ⭐ THÊM: nhận callback
  onLogout,          // ⭐ THÊM: nhận callback logout
  onNavigateHome,
  onShowTeachers,
  onShowStudents,
  onShowExamBank,
  onShowCreateExam,
  onDoExam,
  currentUser,       // Giữ lại để tương thích
  token,             // Giữ lại để tương thích
}) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho modal chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration: 60,
    parts: 1,
    tags: "",
  });

  // State cho câu hỏi
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // API URL
  const apiUrl = process.env.REACT_APP_API_URL || "${API_URL}";

  // =========================
  // Fetch danh sách đề thi
  // =========================
  const fetchExams = async () => {
    setLoading(true);
    try {
      // ⭐ SỬA: Lấy token từ localStorage
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        console.error('❌ Không có token!');
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        if (onLogout) onLogout();
        return;
      }

      console.log('🔑 Fetching exams with token');

      // ⭐ SỬA: Thêm Authorization header
      const res = await fetch(`${apiUrl}/api/exams`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,  // ⭐ QUAN TRỌNG
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', res.status);

      if (res.status === 401) {
        console.error('❌ Token không hợp lệ');
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        if (onLogout) onLogout();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const result = await res.json();
      const examsData = result.data || result;

      const parsed = examsData.map((exam) => ({
        ...exam,
        tags: typeof exam.tags === "string" ? exam.tags.split(",").filter(Boolean) : [],
        attempts: exam.attempts || 0,
        comments: exam.comments || 0,
      }));

      console.log('✅ Loaded', parsed.length, 'exams');
      setExams(parsed);
      setError(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // =========================
  // Xem chi tiết bài thi
  // =========================
  const handleDetail = (exam) => {
    onDoExam(exam.id);
  };

  // =========================
  // Xóa đề thi
  // =========================
  const handleDelete = async (examId) => {
    if (!window.confirm("⚠️ Bạn có chắc muốn xóa đề thi này?")) return;

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/exams/${examId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,  // ⭐ Sử dụng token từ localStorage
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      alert(`✅ ${data.message}`);
      fetchExams();
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("❌ Lỗi khi xóa đề: " + err.message);
    }
  };

  // =========================
  // Mở modal chỉnh sửa
  // =========================
  const handleEdit = async (exam) => {
    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/exams/${exam.id}/full`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,  // ⭐ THÊM token
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        alert('Phiên đăng nhập hết hạn!');
        if (onLogout) onLogout();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      setEditingExam(data.exam);
      setEditForm({
        title: data.exam.title || "",
        description: data.exam.description || "",
        duration: data.exam.duration || 60,
        parts: data.exam.parts || 1,
        tags: data.exam.tags || "",
      });
      setQuestions(data.questions || []);
      setShowEditModal(true);
    } catch (err) {
      console.error("❌ Fetch exam error:", err);
      alert("❌ Lỗi khi tải thông tin đề thi: " + err.message);
    }
  };

  // =========================
  // Đóng modal
  // =========================
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingExam(null);
    setQuestions([]);
    setEditingQuestionId(null);
  };

  // =========================
  // Cập nhật thông tin đề thi
  // =========================
  const handleSaveExamInfo = async (e) => {
    e.preventDefault();

    if (!editForm.title.trim()) {
      alert("⚠️ Vui lòng nhập tên đề thi!");
      return;
    }

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/exams/${editingExam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      alert(`✅ ${data.message}`);
      fetchExams();
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("❌ Lỗi khi cập nhật đề: " + err.message);
    }
  };

  // =========================
  // Xóa câu hỏi
  // =========================
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("⚠️ Xóa câu hỏi này?")) return;

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/questions/${questionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Đã xóa câu hỏi!");
      // Reload questions
      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  // =========================
  // Cập nhật câu hỏi
  // =========================
  const handleUpdateQuestion = async (questionId, newText) => {
    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ question_text: newText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Đã cập nhật câu hỏi!");
      setEditingQuestionId(null);
      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  // =========================
  // Thêm câu hỏi mới
  // =========================
  const handleAddQuestion = async () => {
    const text = prompt("Nhập nội dung câu hỏi mới:");
    if (!text) return;

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          exam_id: editingExam.id,
          question_text: text,
          points: 1,
          answers: []
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Đã thêm câu hỏi mới!");
      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  // =========================
  // Xóa đáp án
  // =========================
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("⚠️ Xóa đáp án này?")) return;

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/answers/${answerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Đã xóa đáp án!");
      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  // =========================
  // Cập nhật đáp án
  // =========================
  const handleUpdateAnswer = async (answerId, newText, isCorrect) => {
    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/answers/${answerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          answer_text: newText,
          is_correct: isCorrect
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  // =========================
  // Thêm đáp án mới
  // =========================
  const handleAddAnswer = async (questionId) => {
    const text = prompt("Nhập nội dung đáp án mới:");
    if (!text) return;

    try {
      const authToken = localStorage.getItem('token');

      const res = await fetch(`${apiUrl}/api/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          question_id: questionId,
          answer_text: text,
          is_correct: false
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Đã thêm đáp án!");
      handleEdit({ id: editingExam.id });
    } catch (err) {
      alert("❌ Lỗi: " + err.message);
    }
  };

  if (loading) return <div className="exam-bank-page">Đang tải danh sách đề...</div>;
  if (error) return <div className="exam-bank-page">Lỗi: {error}</div>;

  return (
    <div className="exam-bank-page">
      {/* ⭐ CẬP NHẬT: Truyền đúng props vào Navbar */}
      <Navbar
        user={user}                  // ⭐ THÊM
        onUpdateUser={onUpdateUser}  // ⭐ THÊM
        onLogout={onLogout}          // ⭐ THÊM
        onNavigateHome={onNavigateHome}
        onShowTeachers={onShowTeachers}
        onShowStudents={onShowStudents}
        onShowExamBank={onShowExamBank}
        onShowCreateExam={onShowCreateExam}
      />

      <div className="exam-bank-container">
        <h1 className="exam-bank-title">Ngân hàng đề – Trắc nghiệm</h1>

        <div className="exam-grid">
          {exams.map((e) => (
            <div key={e.id} className="exam-card">
              <div className="exam-card-body">
                <h3 className="exam-title">{e.title}</h3>

                <div className="exam-meta-row">
                  <span className="exam-meta"><LuClock3 /> {e.duration} phút</span>
                  <span className="exam-sep">|</span>
                  <span className="exam-meta"><LuUsers /> {e.attempts.toLocaleString()}</span>
                  <span className="exam-sep">|</span>
                  <span className="exam-meta"><LuMessageSquare /> {e.comments.toLocaleString()}</span>
                </div>

                <p className="exam-sub">{e.parts} phần thi | {e.questions} câu hỏi</p>

                <div className="exam-tags">
                  {e.tags.map((t, i) => (<span key={i} className="exam-tag">#{t}</span>))}
                </div>
              </div>

              <div className="exam-card-footer">
                <button className="exam-detail-btn" onClick={() => handleDetail(e)}>
                  Chi tiết
                </button>

                {/* ⭐ SỬA: Kiểm tra user.role hoặc currentUser.role_name */}
                {(user?.role === "admin" || user?.role === "teacher" || 
                  currentUser?.role_name === "admin" || currentUser?.role_name === "teacher") && (
                  <>
                    <button className="exam-edit-btn" onClick={() => handleEdit(e)}>
                      <LuPencil /> Sửa
                    </button>

                    <button className="exam-delete-btn" onClick={() => handleDelete(e.id)}>
                      <LuTrash2 /> Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal chỉnh sửa nâng cao */}
      {showEditModal && (
        <div className="edit-modal-overlay" onClick={handleCloseModal}>
          <div className="edit-modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>✏️ Chỉnh sửa đề thi</h2>
              <button className="edit-modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <div className="edit-modal-body">
              {/* Thông tin đề thi */}
              <form onSubmit={handleSaveExamInfo} className="exam-info-form">
                <h3>📋 Thông tin chung</h3>
                
                <div className="form-group">
                  <label>Tên đề thi *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Thời gian (phút)</label>
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số phần thi</label>
                    <input
                      type="number"
                      value={editForm.parts}
                      onChange={(e) => setEditForm({...editForm, parts: e.target.value})}
                      min="1"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save">💾 Lưu thông tin đề</button>
              </form>

              {/* Danh sách câu hỏi */}
              <div className="questions-section">
                <div className="section-header">
                  <h3>📝 Câu hỏi ({questions.length})</h3>
                  <button className="btn-add" onClick={handleAddQuestion}>
                    <LuPlus /> Thêm câu hỏi
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={q.id} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Câu {idx + 1}</span>
                      <div className="question-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => setEditingQuestionId(q.id)}
                        >
                          <LuPencil />
                        </button>
                        <button 
                          className="btn-icon btn-danger"
                          onClick={() => handleDeleteQuestion(q.id)}
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                    </div>

                    {editingQuestionId === q.id ? (
                      <div className="edit-question-form">
                        <textarea
                          defaultValue={q.question_text}
                          id={`q-${q.id}`}
                          rows="3"
                        />
                        <div className="form-actions">
                          <button 
                            className="btn-save-small"
                            onClick={() => {
                              const newText = document.getElementById(`q-${q.id}`).value;
                              handleUpdateQuestion(q.id, newText);
                            }}
                          >
                            <LuCheck /> Lưu
                          </button>
                          <button 
                            className="btn-cancel-small"
                            onClick={() => setEditingQuestionId(null)}
                          >
                            <LuX /> Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="question-text">{q.question_text}</p>
                    )}

                    {/* Đáp án */}
                    <div className="answers-list">
                      {q.answers.map((ans, aidx) => (
                        <div key={ans.id} className="answer-item">
                          <input
                            type="checkbox"
                            checked={ans.is_correct === 1}
                            onChange={(e) => handleUpdateAnswer(ans.id, ans.answer_text, e.target.checked)}
                          />
                          <span className="answer-label">{String.fromCharCode(65 + aidx)}.</span>
                          <input
                            type="text"
                            value={ans.answer_text}
                            onChange={(e) => handleUpdateAnswer(ans.id, e.target.value, ans.is_correct)}
                            className="answer-input"
                          />
                          <button 
                            className="btn-icon btn-danger-small"
                            onClick={() => handleDeleteAnswer(ans.id)}
                          >
                            <LuTrash2 />
                          </button>
                        </div>
                      ))}
                      <button 
                        className="btn-add-answer"
                        onClick={() => handleAddAnswer(q.id)}
                      >
                        <LuPlus /> Thêm đáp án
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="edit-modal-footer">
              <button className="btn-close" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamBankTracNghiem;