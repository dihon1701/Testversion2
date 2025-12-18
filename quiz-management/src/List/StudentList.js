// import React, { useState } from "react";
// // ✅ Đổi tên file CSS import
// import "./StudentList.css"; 
// import Navbar from "../Navbar/Navbar";

// // ✅ Đổi tên mảng dữ liệu và cập nhật thông tin học sinh
// const students = [
//   {
//     id: 101,
//     name: "Nguyễn Văn X",
//     dob: "05/09/2005",
//     address: "Hà Nội",
//     phone: "0911223344",
//     email: "nguyenvanx@school.com",
//     class: "12A1", // ✅ Thông tin mới
//     gpa: "8.5", // ✅ Thông tin mới
//     image: "https://randomuser.me/api/portraits/men/50.jpg",
//   },
//   {
//     id: 102,
//     name: "Trần Thị Y",
//     dob: "18/11/2006",
//     address: "Đà Nẵng",
//     phone: "0912345678",
//     email: "tranthiy@school.com",
//     class: "11B2",
//     gpa: "9.1",
//     image: "https://randomuser.me/api/portraits/women/51.jpg",
//   },
//   {
//     id: 103,
//     name: "Phạm Văn Z",
//     dob: "22/01/2005",
//     address: "TP. Hồ Chí Minh",
//     phone: "0987654321",
//     email: "phamvanz@school.com",
//     class: "12A5",
//     gpa: "7.9",
//     image: "https://randomuser.me/api/portraits/men/52.jpg",
//   },
//   {
//     id: 104,
//     name: "Lê Thị K",
//     dob: "01/03/2007",
//     address: "Hải Phòng",
//     phone: "0905556677",
//     email: "lethik@school.com",
//     class: "10C3",
//     gpa: "8.8",
//     image: "https://randomuser.me/api/portraits/women/53.jpg",
//   },
//   {
//     id: 105,
//     name: "Đỗ Văn L",
//     dob: "15/07/2006",
//     address: "Cần Thơ",
//     phone: "0909887766",
//     email: "dovanl@school.com",
//     class: "11A3",
//     gpa: "7.5",
//     image: "https://randomuser.me/api/portraits/men/54.jpg",
//   },
// ];

// // ✅ Đổi tên component và cập nhật props
// const StudentList = ({ onNavigateHome, onShowTeachers, onShowStudents, onShowExamBank, onShowCreateExam }) => { 
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);

//   // ✅ Đổi tên tham số thành student
//   const handleClick = (student) => {
//     if (selectedStudent && selectedStudent.id === student.id) {
//       setIsPanelOpen(false);
//       setSelectedStudent(null);
//     } else {
//       setSelectedStudent(student);
//       setIsPanelOpen(true);
//     }
//   };

//   const closePanel = () => {
//     setIsPanelOpen(false);
//     setSelectedStudent(null);
//   };

//   return (
//     <div>
//       <Navbar 
//       onNavigateHome={onNavigateHome} 
//       onShowTeachers={onShowTeachers} 
//       onShowStudents={onShowStudents}
//       onShowExamBank={onShowExamBank}
//       onShowCreateExam={onShowCreateExam}
//       /> 
      
//       <div className="teacher-page-content"> 
//         <div className="teacher-container">
//           {students.map((student) => ( // ✅ Lặp qua students
//             <div
//               key={student.id}
//               // ✅ Sử dụng student thay vì teacher
//               className={`teacher-card ${selectedStudent && selectedStudent.id === student.id ? "selected" : ""}`}
//               onClick={() => handleClick(student)}
//             >
//               <div className="teacher-image-wrapper"> 
//                 <img src={student.image} alt={student.name} />
//               </div>
//               <div className="teacher-info-brief"> 
//                 <h3>{student.name}</h3>
//                 {/* ✅ Hiển thị thông tin tóm tắt mới */}
//                 <p>{student.class} - GPA: {student.gpa}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Panel chi tiết học sinh */}
//         <div className={`teacher-detail-panel ${isPanelOpen ? "open" : ""}`}>
//           <button className="close-panel-btn" onClick={closePanel}>
//             &times; 
//           </button>
//           {selectedStudent && ( // ✅ Sử dụng selectedStudent
//             <div className="detail-content">
//               <h2>{selectedStudent.name}</h2>
//               <div className="detail-row">
//                 <strong>Ngày sinh:</strong> <span>{selectedStudent.dob}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Địa chỉ:</strong> <span>{selectedStudent.address}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>SĐT:</strong> <span>{selectedStudent.phone}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Email:</strong> <span>{selectedStudent.email}</span>
//               </div>
//               {/* ✅ Hiển thị thông tin chi tiết mới */}
//               <div className="detail-row">
//                 <strong>Lớp học:</strong> <span>{selectedStudent.class}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Điểm GPA:</strong> <span>{selectedStudent.gpa}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentList; // ✅ Export StudentList

import React, { useState } from "react";
import "./StudentList.css"; 
import Navbar from "../Navbar/Navbar";

const students = [
  {
    id: 101,
    name: "Nguyễn Văn X",
    dob: "05/09/2005",
    address: "Hà Nội",
    phone: "0911223344",
    email: "nguyenvanx@school.com",
    class: "12A1",
    gpa: "8.5",
    image: "https://randomuser.me/api/portraits/men/50.jpg",
  },
  {
    id: 102,
    name: "Trần Thị Y",
    dob: "18/11/2006",
    address: "Đà Nẵng",
    phone: "0912345678",
    email: "tranthiy@school.com",
    class: "11B2",
    gpa: "9.1",
    image: "https://randomuser.me/api/portraits/women/51.jpg",
  },
  {
    id: 103,
    name: "Phạm Văn Z",
    dob: "22/01/2005",
    address: "TP. Hồ Chí Minh",
    phone: "0987654321",
    email: "phamvanz@school.com",
    class: "12A5",
    gpa: "7.9",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: 104,
    name: "Lê Thị K",
    dob: "01/03/2007",
    address: "Hải Phòng",
    phone: "0905556677",
    email: "lethik@school.com",
    class: "10C3",
    gpa: "8.8",
    image: "https://randomuser.me/api/portraits/women/53.jpg",
  },
  {
    id: 105,
    name: "Đỗ Văn L",
    dob: "15/07/2006",
    address: "Cần Thơ",
    phone: "0909887766",
    email: "dovanl@school.com",
    class: "11A3",
    gpa: "7.5",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
  },
];

const StudentList = ({ 
  onLogout,
  onNavigateHome, 
  onShowTeachers, 
  onShowStudents, 
  onShowExamBank, 
  onShowCreateExam 
}) => { 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClick = (student) => {
    if (selectedStudent && selectedStudent.id === student.id) {
      setIsPanelOpen(false);
      setSelectedStudent(null);
    } else {
      setSelectedStudent(student);
      setIsPanelOpen(true);
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <Navbar 
        onLogout={onLogout}
        onNavigateHome={onNavigateHome} 
        onShowTeachers={onShowTeachers} 
        onShowStudents={onShowStudents}
        onShowExamBank={onShowExamBank}
        onShowCreateExam={onShowCreateExam}
      /> 
      
      <div className="teacher-page-content"> 
        <div className="teacher-container">
          {students.map((student) => (
            <div
              key={student.id}
              className={`teacher-card ${selectedStudent && selectedStudent.id === student.id ? "selected" : ""}`}
              onClick={() => handleClick(student)}
            >
              <div className="teacher-image-wrapper"> 
                <img src={student.image} alt={student.name} />
              </div>
              <div className="teacher-info-brief"> 
                <h3>{student.name}</h3>
                <p>{student.class} - GPA: {student.gpa}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Panel chi tiết học sinh */}
        <div className={`teacher-detail-panel ${isPanelOpen ? "open" : ""}`}>
          <button className="close-panel-btn" onClick={closePanel}>
            &times; 
          </button>
          {selectedStudent && (
            <div className="detail-content">
              <h2>{selectedStudent.name}</h2>
              <div className="detail-row">
                <strong>Ngày sinh:</strong> <span>{selectedStudent.dob}</span>
              </div>
              <div className="detail-row">
                <strong>Địa chỉ:</strong> <span>{selectedStudent.address}</span>
              </div>
              <div className="detail-row">
                <strong>SĐT:</strong> <span>{selectedStudent.phone}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong> <span>{selectedStudent.email}</span>
              </div>
              <div className="detail-row">
                <strong>Lớp học:</strong> <span>{selectedStudent.class}</span>
              </div>
              <div className="detail-row">
                <strong>Điểm GPA:</strong> <span>{selectedStudent.gpa}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList;