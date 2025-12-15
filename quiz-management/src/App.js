// import React, { useState } from "react";
// import LoginPage from "./Login/LoginPage";
// import RegisterPage from "./Register/RegisterPage";
// import HomePage from "./Home/HomePage";
// import IntroducePage from "./Introduce/IntroducePage";
// import TeacherList from "./List/TeacherList";
// import StudentList from "./List/StudentList";
// import ExamBankTracNghiem from "./ExamBank/ExamBankTracNghiem";
// import ExamBankTuLuan from "./ExamBank/ExamBankTuLuan";
// import CreateExamTracNghiem from "./CreateExam/CreateExamTracNghiem";
// import DoExamPage from "./DoExam/DoExamPage";

// function App() {
//   const [currentPage, setCurrentPage] = useState("login");
//   const [userEmail, setUserEmail] = useState("");
//   const [currentExamId, setCurrentExamId] = useState(null);
  
//   // ================================
//   // 🔑 THÊM STATE MỚI - Lưu user info và token
//   // ================================
//   const [currentUser, setCurrentUser] = useState(null); // { id, username, role_name }
//   const [token, setToken] = useState(null); // JWT token

//   // ================================
//   // 🌐 Xử lý login/logout
//   // ================================
//   const handleLoginSuccess = (email, userData, authToken) => {
//     setUserEmail(email);
//     setCurrentUser(userData); // Lưu thông tin user
//     setToken(authToken); // Lưu token
//     setCurrentPage("home");
//   };

//   const handleSwitchToRegister = () => setCurrentPage("register");
//   const handleSwitchToLogin = () => setCurrentPage("login");

//   const handleLogout = () => {
//     setUserEmail("");
//     setCurrentUser(null); // Clear user info
//     setToken(null); // Clear token
//     setCurrentPage("login");
//   };

//   // ================================
//   // 🌐 Chuyển trang
//   // ================================
//   const handleStartIntroduce = () => setCurrentPage("introduce");
//   const handleBackToHome = () => setCurrentPage("home");

//   const handleShowTeachers = () => setCurrentPage("teacherList");
//   const handleShowStudents = () => setCurrentPage("studentList");

//   const handleShowExamBank = (type) => {
//     if (type === "tracnghiem") setCurrentPage("examBankTracNghiem");
//     else if (type === "tuluan") setCurrentPage("examBankTuLuan");
//   };

//   const handleShowCreateExam = (type) => {
//     if (type === "tracnghiem") setCurrentPage("createExamTracNghiem");
//     else if (type === "tuluan") setCurrentPage("createExamTuLuan");
//   };

//   // ================================
//   // 🌟 Làm bài thi
//   // ================================
//   const handleDoExam = (examId) => {
//     setCurrentExamId(examId);
//     setCurrentPage("doExam");
//   };

//   // ================================
//   // 🔹 Render theo page
//   // ================================
//   return (
//     <div>
//       {currentPage === "login" && (
//         <LoginPage
//           onSwitch={handleSwitchToRegister}
//           onLoginSuccess={handleLoginSuccess}
//         />
//       )}

//       {currentPage === "register" && (
//         <RegisterPage onSwitch={handleSwitchToLogin} />
//       )}

//       {currentPage === "home" && (
//         <HomePage
//           email={userEmail}
//           onLogout={handleLogout}
//           onStartIntroduce={handleStartIntroduce}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onNavigateHome={handleBackToHome}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//         />
//       )}

//       {currentPage === "introduce" && (
//         <IntroducePage onBack={handleBackToHome} />
//       )}

//       {currentPage === "teacherList" && (
//         <TeacherList
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//         />
//       )}

//       {currentPage === "studentList" && (
//         <StudentList
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//         />
//       )}

//       {currentPage === "examBankTracNghiem" && (
//         <ExamBankTracNghiem
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//           onDoExam={handleDoExam}
//           currentUser={currentUser} // ⭐ THÊM PROP NÀY
//           token={token} // ⭐ THÊM PROP NÀY
//         />
//       )}

//       {currentPage === "examBankTuLuan" && (
//         <ExamBankTuLuan
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//           onDoExam={handleDoExam}
//           currentUser={currentUser} // ⭐ THÊM PROP NÀY
//           token={token} // ⭐ THÊM PROP NÀY
//         />
//       )}

//       {currentPage === "createExamTracNghiem" && (
//         <CreateExamTracNghiem
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//         />
//       )}

//       {currentPage === "doExam" && currentExamId && (
//         <DoExamPage
//           examId={currentExamId}
//           onNavigateHome={handleBackToHome}
//           onShowTeachers={handleShowTeachers}
//           onShowStudents={handleShowStudents}
//           onShowExamBank={handleShowExamBank}
//           onShowCreateExam={handleShowCreateExam}
//         />
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import LoginPage from "./Login/LoginPage";
import RegisterPage from "./Register/RegisterPage";
import HomePage from "./Home/HomePage";
import IntroducePage from "./Introduce/IntroducePage";
import TeacherList from "./List/TeacherList";
import StudentList from "./List/StudentList";
import ExamBankTracNghiem from "./ExamBank/ExamBankTracNghiem";
import ExamBankTuLuan from "./ExamBank/ExamBankTuLuan";
import CreateExamTracNghiem from "./CreateExam/CreateExamTracNghiem";
import DoExamPage from "./DoExam/DoExamPage";
import { API_URL } from "./config/api";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [userEmail, setUserEmail] = useState("");
  const [currentExamId, setCurrentExamId] = useState(null);
  
  // ================================
  // 🔑 STATE - User info và token
  // ================================
  const [currentUser, setCurrentUser] = useState(null); 
  const [token, setToken] = useState(null);

  // ================================
  // 🔄 useEffect: Load user từ localStorage khi app khởi động
  // ================================
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('userData');

    if (savedToken && savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        console.log('✅ Load user từ localStorage:', userData);
        
        setToken(savedToken);
        setCurrentUser(userData);
        setUserEmail(userData.email || userData.username);
        setCurrentPage("home");

        // Verify token còn hợp lệ không
        verifyToken(savedToken);
      } catch (error) {
        console.error('❌ Lỗi parse userData:', error);
        handleLogout();
      }
    }
  }, []);

  // ================================
  // 🔐 Verify token với server
  // ================================
  const verifyToken = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Token không hợp lệ, đăng xuất...');
        handleLogout();
      } else {
        const data = await response.json();
        console.log('✅ Token hợp lệ:', data);
      }
    } catch (error) {
      console.error('❌ Lỗi verify token:', error);
    }
  };

  // ================================
  // 🌐 Xử lý login
  // ================================
  const handleLoginSuccess = (email, userData, authToken) => {
    console.log('✅ Login success:', { email, userData, authToken });
    
    setUserEmail(email);
    setCurrentUser(userData);
    setToken(authToken);
    
    // Lưu vào localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setCurrentPage("home");
  };

  // ================================
  // 🚪 Xử lý logout
  // ================================
  const handleLogout = () => {
    console.log('🚪 Đăng xuất...');
    
    // Clear state
    setUserEmail("");
    setCurrentUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    setCurrentPage("login");
  };

  // ================================
  // ✏️ Callback: Cập nhật thông tin user từ Navbar
  // ================================
  const handleUpdateUser = (updatedUser) => {
    console.log('✅ App.js nhận được user data cập nhật:', updatedUser);
    
    // Cập nhật state
    setCurrentUser(updatedUser);
    setUserEmail(updatedUser.email || updatedUser.username);
    
    // Cập nhật localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  // ================================
  // 🌐 Chuyển trang
  // ================================
  const handleSwitchToRegister = () => setCurrentPage("register");
  const handleSwitchToLogin = () => setCurrentPage("login");
  const handleStartIntroduce = () => setCurrentPage("introduce");
  const handleBackToHome = () => setCurrentPage("home");
  const handleShowTeachers = () => setCurrentPage("teacherList");
  const handleShowStudents = () => setCurrentPage("studentList");

  const handleShowExamBank = (type) => {
    if (type === "tracnghiem") setCurrentPage("examBankTracNghiem");
    else if (type === "tuluan") setCurrentPage("examBankTuLuan");
  };

  const handleShowCreateExam = (type) => {
    if (type === "tracnghiem") setCurrentPage("createExamTracNghiem");
    else if (type === "tuluan") setCurrentPage("createExamTuLuan");
  };

  const handleDoExam = (examId) => {
    setCurrentExamId(examId);
    setCurrentPage("doExam");
  };

  // ================================
  // 🔹 Render theo page
  // ================================
  return (
    <div>
      {currentPage === "login" && (
        <LoginPage
          onSwitch={handleSwitchToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === "register" && (
        <RegisterPage onSwitch={handleSwitchToLogin} />
      )}

      {currentPage === "home" && (
        <HomePage
          email={userEmail}
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onStartIntroduce={handleStartIntroduce}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onNavigateHome={handleBackToHome}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
        />
      )}

      {currentPage === "introduce" && (
        <IntroducePage onBack={handleBackToHome} />
      )}

      {currentPage === "teacherList" && (
        <TeacherList
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
        />
      )}

      {currentPage === "studentList" && (
        <StudentList
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
        />
      )}

      {currentPage === "examBankTracNghiem" && (
        <ExamBankTracNghiem
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
          onDoExam={handleDoExam}
          currentUser={currentUser}
          token={token}
        />
      )}

      {currentPage === "examBankTuLuan" && (
        <ExamBankTuLuan
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
          onDoExam={handleDoExam}
          currentUser={currentUser}
          token={token}
        />
      )}

      {currentPage === "createExamTracNghiem" && (
        <CreateExamTracNghiem
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
        />
      )}

      {currentPage === "doExam" && currentExamId && (
        <DoExamPage
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          examId={currentExamId}
          onNavigateHome={handleBackToHome}
          onShowTeachers={handleShowTeachers}
          onShowStudents={handleShowStudents}
          onShowExamBank={handleShowExamBank}
          onShowCreateExam={handleShowCreateExam}
        />
      )}
    </div>
  );
}

export default App;