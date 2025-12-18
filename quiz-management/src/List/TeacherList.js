// import React, { useState } from "react"; // Import useState
// import "./TeacherList.css";
// import Navbar from "../Navbar/Navbar";

// const teachers = [
//   {
//     id: 1,
//     name: "Nguyễn Văn A",
//     dob: "12/03/1980",
//     address: "Hà Nội",
//     phone: "0901234567",
//     email: "nguyenvana@gmail.com",
//     subject: "Toán học",
//     since: "2008",
//     image: "https://randomuser.me/api/portraits/men/32.jpg", // Ảnh cũ, sẽ dùng CSS để tạo khổ dọc
//   },
//   {
//     id: 2,
//     name: "Trần Thị B",
//     dob: "25/07/1985",
//     address: "Đà Nẵng",
//     phone: "0908765432",
//     email: "tranthib@gmail.com",
//     subject: "Vật lý",
//     since: "2010",
//     image: "https://randomuser.me/api/portraits/women/44.jpg",
//   },
//   {
//     id: 3,
//     name: "Phạm Văn C",
//     dob: "02/11/1982",
//     address: "TP. Hồ Chí Minh",
//     phone: "0912345678",
//     email: "phamvanc@gmail.com",
//     subject: "Hóa học",
//     since: "2009",
//     image: "https://randomuser.me/api/portraits/men/76.jpg",
//   },
//   {
//     id: 4,
//     name: "Lê Thị D",
//     dob: "10/05/1990",
//     address: "Hải Phòng",
//     phone: "0932123456",
//     email: "lethid@gmail.com",
//     subject: "Ngữ văn",
//     since: "2012",
//     image: "https://randomuser.me/api/portraits/women/65.jpg",
//   },
//   {
//     id: 5,
//     name: "Đỗ Văn E",
//     dob: "15/02/1984",
//     address: "Cần Thơ",
//     phone: "0941122334",
//     email: "dovane@gmail.com",
//     subject: "Tin học",
//     since: "2011",
//     image: "https://randomuser.me/api/portraits/men/28.jpg",
//   },
//   {
//     id: 6,
//     name: "Hoàng Thị F",
//     dob: "09/09/1988",
//     address: "Huế",
//     phone: "0956677889",
//     email: "hoangthif@gmail.com",
//     subject: "Sinh học",
//     since: "2014",
//     image: "https://randomuser.me/api/portraits/women/12.jpg",
//   },
//   {
//     id: 7,
//     name: "Ngô Văn G",
//     dob: "20/04/1983",
//     address: "Nghệ An",
//     phone: "0977445566",
//     email: "ngovang@gmail.com",
//     subject: "Lịch sử",
//     since: "2007",
//     image: "https://randomuser.me/api/portraits/men/55.jpg",
//   },
//   {
//     id: 8,
//     name: "Bùi Thị H",
//     dob: "13/06/1992",
//     address: "Quảng Nam",
//     phone: "0967788990",
//     email: "buithih@gmail.com",
//     subject: "Địa lý",
//     since: "2015",
//     image: "https://randomuser.me/api/portraits/women/19.jpg",
//   },
//   {
//     id: 9,
//     name: "Phan Văn I",
//     dob: "30/10/1981",
//     address: "Bình Dương",
//     phone: "0933445566",
//     email: "phanvani@gmail.com",
//     subject: "Giáo dục công dân",
//     since: "2006",
//     image: "https://randomuser.me/api/portraits/men/11.jpg",
//   },
// ];

// const TeacherList = ({ onNavigateHome, onShowTeachers, onShowStudents, onShowExamBank, onShowCreateExam }) => {
//   // State để lưu giáo viên đang được chọn và trạng thái hiển thị panel
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);

//   const handleClick = (teacher) => {
//     // Nếu click vào giáo viên đang được chọn, đóng panel. Ngược lại, mở panel và chọn giáo viên mới.
//     if (selectedTeacher && selectedTeacher.id === teacher.id) {
//       setIsPanelOpen(false);
//       setSelectedTeacher(null);
//     } else {
//       setSelectedTeacher(teacher);
//       setIsPanelOpen(true);
//     }
//   };

//   const closePanel = () => {
//     setIsPanelOpen(false);
//     setSelectedTeacher(null);
//   };

//   return (
//     <div>
//       <Navbar />
//       <Navbar 
//         onNavigateHome={onNavigateHome} 
//         onShowTeachers={onShowTeachers} 
//         onShowStudents={onShowStudents}
//         onShowExamBank={onShowExamBank}
//         onShowCreateExam={onShowCreateExam}
//       /> 
//       <div className="teacher-page-content"> {/* Thêm một div bọc ngoài để quản lý layout */}
//         <div className="teacher-container">
//           {teachers.map((teacher) => (
//             <div
//               key={teacher.id}
//               className={`teacher-card ${selectedTeacher && selectedTeacher.id === teacher.id ? "selected" : ""}`}
//               onClick={() => handleClick(teacher)}
//             >
//               <div className="teacher-image-wrapper"> {/* Thêm wrapper cho ảnh */}
//                 <img src={teacher.image} alt={teacher.name} />
//               </div>
//               <div className="teacher-info-brief"> {/* Thông tin tóm tắt */}
//                 <h3>{teacher.name}</h3>
//                 <p>{teacher.subject}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Panel chi tiết giáo viên */}
//         <div className={`teacher-detail-panel ${isPanelOpen ? "open" : ""}`}>
//           <button className="close-panel-btn" onClick={closePanel}>
//             &times; {/* Dấu 'x' để đóng panel */}
//           </button>
//           {selectedTeacher && (
//             <div className="detail-content">
//               <h2>{selectedTeacher.name}</h2>
//               <div className="detail-row">
//                 <strong>Ngày sinh:</strong> <span>{selectedTeacher.dob}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Địa chỉ:</strong> <span>{selectedTeacher.address}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>SĐT:</strong> <span>{selectedTeacher.phone}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Email:</strong> <span>{selectedTeacher.email}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Chuyên ngành:</strong> <span>{selectedTeacher.subject}</span>
//               </div>
//               <div className="detail-row">
//                 <strong>Bắt đầu dạy:</strong> <span>{selectedTeacher.since}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherList;

import React, { useState } from "react";
import "./TeacherList.css";
import Navbar from "../Navbar/Navbar";

const teachers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    dob: "12/03/1980",
    address: "Hà Nội",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    subject: "Toán học",
    since: "2008",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Trần Thị B",
    dob: "25/07/1985",
    address: "Đà Nẵng",
    phone: "0908765432",
    email: "tranthib@gmail.com",
    subject: "Vật lý",
    since: "2010",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Phạm Văn C",
    dob: "02/11/1982",
    address: "TP. Hồ Chí Minh",
    phone: "0912345678",
    email: "phamvanc@gmail.com",
    subject: "Hóa học",
    since: "2009",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    id: 4,
    name: "Lê Thị D",
    dob: "10/05/1990",
    address: "Hải Phòng",
    phone: "0932123456",
    email: "lethid@gmail.com",
    subject: "Ngữ văn",
    since: "2012",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 5,
    name: "Đỗ Văn E",
    dob: "15/02/1984",
    address: "Cần Thơ",
    phone: "0941122334",
    email: "dovane@gmail.com",
    subject: "Tin học",
    since: "2011",
    image: "https://randomuser.me/api/portraits/men/28.jpg",
  },
  {
    id: 6,
    name: "Hoàng Thị F",
    dob: "09/09/1988",
    address: "Huế",
    phone: "0956677889",
    email: "hoangthif@gmail.com",
    subject: "Sinh học",
    since: "2014",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 7,
    name: "Ngô Văn G",
    dob: "20/04/1983",
    address: "Nghệ An",
    phone: "0977445566",
    email: "ngovang@gmail.com",
    subject: "Lịch sử",
    since: "2007",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    id: 8,
    name: "Bùi Thị H",
    dob: "13/06/1992",
    address: "Quảng Nam",
    phone: "0967788990",
    email: "buithih@gmail.com",
    subject: "Địa lý",
    since: "2015",
    image: "https://randomuser.me/api/portraits/women/19.jpg",
  },
  {
    id: 9,
    name: "Phan Văn I",
    dob: "30/10/1981",
    address: "Bình Dương",
    phone: "0933445566",
    email: "phanvani@gmail.com",
    subject: "Giáo dục công dân",
    since: "2006",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  },
];

const TeacherList = ({ 
  onLogout,
  onNavigateHome, 
  onShowTeachers, 
  onShowStudents, 
  onShowExamBank, 
  onShowCreateExam 
}) => {
  // State để lưu giáo viên đang được chọn và trạng thái hiển thị panel
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClick = (teacher) => {
    // Nếu click vào giáo viên đang được chọn, đóng panel. Ngược lại, mở panel và chọn giáo viên mới.
    if (selectedTeacher && selectedTeacher.id === teacher.id) {
      setIsPanelOpen(false);
      setSelectedTeacher(null);
    } else {
      setSelectedTeacher(teacher);
      setIsPanelOpen(true);
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedTeacher(null);
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
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className={`teacher-card ${selectedTeacher && selectedTeacher.id === teacher.id ? "selected" : ""}`}
              onClick={() => handleClick(teacher)}
            >
              <div className="teacher-image-wrapper">
                <img src={teacher.image} alt={teacher.name} />
              </div>
              <div className="teacher-info-brief">
                <h3>{teacher.name}</h3>
                <p>{teacher.subject}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Panel chi tiết giáo viên */}
        <div className={`teacher-detail-panel ${isPanelOpen ? "open" : ""}`}>
          <button className="close-panel-btn" onClick={closePanel}>
            &times;
          </button>
          {selectedTeacher && (
            <div className="detail-content">
              <h2>{selectedTeacher.name}</h2>
              <div className="detail-row">
                <strong>Ngày sinh:</strong> <span>{selectedTeacher.dob}</span>
              </div>
              <div className="detail-row">
                <strong>Địa chỉ:</strong> <span>{selectedTeacher.address}</span>
              </div>
              <div className="detail-row">
                <strong>SĐT:</strong> <span>{selectedTeacher.phone}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong> <span>{selectedTeacher.email}</span>
              </div>
              <div className="detail-row">
                <strong>Chuyên ngành:</strong> <span>{selectedTeacher.subject}</span>
              </div>
              <div className="detail-row">
                <strong>Bắt đầu dạy:</strong> <span>{selectedTeacher.since}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherList;