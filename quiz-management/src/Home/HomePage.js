// // import React from 'react';
// // import './HomePage.css';
// // import Navbar from '../Navbar/Navbar';
// // import illustrationHomeIntro from '../assets/HomeIntro1.png';

// // const HeroSection = ({ onStart }) => {
// //     return (
// //         <div className="hero-container system-hero">
// //             <div className="background-effects system-bg-effects"></div>

// //             <div className="hero-content">
// //                 <div className="hero-main-content">
// //                     {/* Cột 1: Hình ảnh */}
// //                     <div className="hero-illustration">
// //                         <img src={illustrationHomeIntro} alt="Online Testing Illustration" />
// //                     </div>

// //                     {/* Cột 2: Tiêu đề và nút */}
// //                     <div className="hero-text-and-action">
// //                         <h1 className="hero-title system-title">
// //                             <span className="title-line">Tạo đề nhanh,</span>
// //                             <br />
// //                             chấm điểm tự động,
// //                             <br />
// //                             quản lý dễ dàng.
// //                         </h1>
// //                         <button
// //                             className="btn-discover-now btn-system-action"
// //                             onClick={onStart}
// //                         >
// //                             KHÁM PHÁ NGAY
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div className="corner-robot system-corner-icon">📊</div>
// //         </div>
// //     );
// // };


// // const HomePage = ({ email, onLogout, onStartIntroduce, onShowTeachers, onShowStudents, onShowExamBank, onShowCreateExam }) => {
// //     return (
// //         <div className="home-page-wrapper">
// //             {/* Truyền prop onShowTeachers xuống Navbar */}
// //             <Navbar 
// //                 onLogout={onLogout} 
// //                 user={email} 
// //                 onShowTeachers={onShowTeachers}
// //                 onShowStudents={onShowStudents} 
// //                 onShowExamBank={onShowExamBank}
// //                 onShowCreateExam={onShowCreateExam}
// //             />
// //             <HeroSection onStart={onStartIntroduce} />
// //         </div>
// //     );
// // };

// // export default HomePage;

// import React from 'react';
// import './HomePage.css';
// import Navbar from '../Navbar/Navbar';
// import illustrationHomeIntro from '../assets/HomeIntro1.png';

// const HeroSection = ({ onStart }) => {
//     return (
//         <div className="hero-container system-hero">
//             <div className="background-effects system-bg-effects"></div>

//             <div className="hero-content">
//                 <div className="hero-main-content">
//                     {/* Cột 1: Hình ảnh */}
//                     <div className="hero-illustration">
//                         <img src={illustrationHomeIntro} alt="Online Testing Illustration" />
//                     </div>

//                     {/* Cột 2: Tiêu đề và nút */}
//                     <div className="hero-text-and-action">
//                         <h1 className="hero-title system-title">
//                             <span className="title-line">Tạo đề nhanh,</span>
//                             <br />
//                             chấm điểm tự động,
//                             <br />
//                             quản lý dễ dàng.
//                         </h1>
//                         <button
//                             className="btn-discover-now btn-system-action"
//                             onClick={onStart}
//                         >
//                             KHÁM PHÁ NGAY
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="corner-robot system-corner-icon">📊</div>
//         </div>
//     );
// };

// const HomePage = ({ 
//     email,              // Giữ lại để tương thích ngược
//     user,               // ⭐ THÊM: Object chứa thông tin user đầy đủ
//     onUpdateUser,       // ⭐ THÊM: Callback khi user cập nhật thông tin
//     onLogout, 
//     onStartIntroduce, 
//     onShowTeachers, 
//     onShowStudents, 
//     onShowExamBank, 
//     onShowCreateExam,
//     onNavigateHome      // ⭐ THÊM: Callback về trang chủ
// }) => {
//     return (
//         <div className="home-page-wrapper">
//             {/* ⭐ CẬP NHẬT: Truyền đúng props vào Navbar */}
//             <Navbar 
//                 user={user}                         // Object: { id, username, name, email, phone, department, role }
//                 onUpdateUser={onUpdateUser}         // Callback để cập nhật user
//                 onLogout={onLogout}
//                 onNavigateHome={onNavigateHome || (() => window.location.reload())}  // Fallback nếu không có
//                 onShowTeachers={onShowTeachers}
//                 onShowStudents={onShowStudents} 
//                 onShowExamBank={onShowExamBank}
//                 onShowCreateExam={onShowCreateExam}
//             />
//             <HeroSection onStart={onStartIntroduce} />
//         </div>
//     );
// };

// export default HomePage;


import React from 'react';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';
import illustrationHomeIntro from '../assets/HomeIntro1.png';
import useAuth from '../useAuth';

const HeroSection = ({ onStart }) => {
    return (
        <div className="hero-container system-hero">
            <div className="background-effects system-bg-effects"></div>

            <div className="hero-content">
                <div className="hero-main-content">
                    {/* Cột 1: Hình ảnh */}
                    <div className="hero-illustration">
                        <img src={illustrationHomeIntro} alt="Online Testing Illustration" />
                    </div>

                    {/* Cột 2: Tiêu đề và nút */}
                    <div className="hero-text-and-action">
                        <h1 className="hero-title system-title">
                            <span className="title-line">Tạo đề nhanh,</span>
                            <br />
                            chấm điểm tự động,
                            <br />
                            quản lý dễ dàng.
                        </h1>
                        <button
                            className="btn-discover-now btn-system-action"
                            onClick={onStart}
                        >
                            KHÁM PHÁ NGAY
                        </button>
                    </div>
                </div>
            </div>

            <div className="corner-robot system-corner-icon">📊</div>
        </div>
    );
};

const HomePage = ({ 
    onLogout, 
    onStartIntroduce, 
    onShowTeachers, 
    onShowStudents, 
    onShowExamBank, 
    onShowCreateExam,
    onNavigateHome
}) => {
    // ✅ Lấy user từ AuthContext thay vì props
    const { currentUser, loading } = useAuth();

    // Loading state
    if (loading) {
        return (
            <div className="home-page-wrapper">
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh' 
                }}>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page-wrapper">
            <Navbar 
                onLogout={onLogout}
                onNavigateHome={onNavigateHome}
                onShowTeachers={onShowTeachers}
                onShowStudents={onShowStudents} 
                onShowExamBank={onShowExamBank}
                onShowCreateExam={onShowCreateExam}
            />
            <HeroSection onStart={onStartIntroduce} />
        </div>
    );
};

export default HomePage;