// // import React, { useState } from "react";
// // import "./LoginPage.css";
// // import { FaUserCircle } from "react-icons/fa";

// // function LoginPage(props) {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);

// //   const handleLogin = async (e) => {
// //     e.preventDefault();

// //     if (!username || !password) {
// //       alert("Vui lòng nhập đầy đủ thông tin!");
// //       return;
// //     }

// //     try {
// //       // Gọi API backend login
// //       const res = await fetch("${API_URL}/api/auth/login", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ username, password }),
// //       });

// //       const data = await res.json();

// //       if (!res.ok) {
// //         alert(data.message);
// //         return;
// //       }

// //       // Lưu token, role, fullname vào localStorage
// //       localStorage.setItem("token", data.token);
// //       localStorage.setItem("role", data.role);
// //       localStorage.setItem("fullname", data.fullname);

// //       alert(`Đăng nhập thành công! Role: ${data.role}`);

// //       // ================================
// //       // ⭐ SỬA DÒNG NÀY - Truyền đúng format
// //       // ================================
// //       if (props.onLoginSuccess) {
// //         const userData = {
// //           id: data.id || data.userId, // Tùy backend trả về field gì
// //           username: username,
// //           role_name: data.role, // ⚠️ Quan trọng: phải là role_name
// //         };

// //         props.onLoginSuccess(
// //           data.fullname || username, // email/fullname
// //           userData, // object chứa user info
// //           data.token // JWT token
// //         );
// //       }

// //       // Chuyển hướng theo role (nếu dùng react-router)
// //       if (props.navigate) {
// //         if (data.role === "admin") props.navigate("/admin");
// //         else if (data.role === "teacher") props.navigate("/teacher");
// //         else props.navigate("/student");
// //       }

// //     } catch (err) {
// //       console.error(err);
// //       alert("Lỗi server, vui lòng thử lại");
// //     }
// //   };

// //   return (
// //     <div className="login-wrapper">
// //       <h1 className="main-title">HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>

// //       <div className="login-card">
// //         <div className="card-icon">
// //           <FaUserCircle />
// //         </div>

// //         <form onSubmit={handleLogin} className="login-form">
// //           <div className="input-group">
// //             <label>Username</label>
// //             <input
// //               type="text"
// //               placeholder="Nhập username..."
// //               value={username}
// //               onChange={(e) => setUsername(e.target.value)}
// //             />
// //           </div>

// //           <div className="input-group">
// //             <label>Mật khẩu</label>
// //             <div className="password-field">
// //               <input
// //                 type={showPassword ? "text" : "password"}
// //                 placeholder="Nhập mật khẩu..."
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //               />
// //               <span
// //                 className="toggle"
// //                 onClick={() => setShowPassword(!showPassword)}
// //               >
// //                 {showPassword ? "👁️" : "🙈"}
// //               </span>
// //             </div>
// //           </div>

// //           <button type="submit" className="login-btn">
// //             Đăng nhập
// //           </button>

// //           <p className="note">
// //             Quên mật khẩu?
// //             <button className="link-btn">Khôi phục tại đây</button>
// //           </p>

// //           <p className="signup-note">
// //             Chưa có tài khoản?{" "}
// //             <button className="link-btn" onClick={props.onSwitch}>
// //               Đăng ký tại đây
// //             </button>
// //           </p>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }

// // export default LoginPage;


// import React, { useState } from "react";
// import "./LoginPage.css";
// import { FaUserCircle } from "react-icons/fa";
// import { API_URL } from "../config/api";



// function LoginPage(props) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       alert("Vui lòng nhập đầy đủ thông tin!");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const res = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.message || "Đăng nhập thất bại!");
//         setIsLoading(false);
//         return;
//       }

//       console.log("✅ Login response từ server:", data);

//       // ================================
//       // ⭐ FORMAT MỚI: API trả về data.user object
//       // ================================
//       // data = {
//       //   message: "Đăng nhập thành công!",
//       //   token: "eyJhbGc...",
//       //   user: {
//       //     id: 2,
//       //     username: "teacher1",
//       //     name: "Giáo viên A",
//       //     email: "teacher1@university.edu.vn",
//       //     phone: "0987654321",
//       //     department: "Khoa CNTT",
//       //     role: "teacher"
//       //   }
//       // }

//       // Lưu vào localStorage
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("userData", JSON.stringify(data.user));

//       // Giữ lại format cũ để tương thích
//       localStorage.setItem("role", data.user.role);
//       localStorage.setItem("fullname", data.user.name);

//       console.log("✅ Đã lưu token và userData vào localStorage");

//       alert(`Đăng nhập thành công! Chào mừng ${data.user.name}`);

//       // ⭐ QUAN TRỌNG: Gọi callback với đúng format
//       if (props.onLoginSuccess) {
//         props.onLoginSuccess(
//           data.user.email || data.user.username,  // email (tham số 1)
//           data.user,                               // userData object (tham số 2)
//           data.token                               // JWT token (tham số 3)
//         );
//       }

//       // Chuyển hướng theo role (nếu dùng react-router)
//       if (props.navigate) {
//         if (data.user.role === "admin") props.navigate("/admin");
//         else if (data.user.role === "teacher") props.navigate("/teacher");
//         else props.navigate("/student");
//       }

//     } catch (err) {
//       console.error("❌ Login error:", err);
//       alert("Lỗi kết nối server, vui lòng thử lại!");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="login-wrapper">
//       <h1 className="main-title">HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>

//       <div className="login-card">
//         <div className="card-icon">
//           <FaUserCircle />
//         </div>

//         <form onSubmit={handleLogin} className="login-form">
//           <div className="input-group">
//             <label>Username</label>
//             <input
//               type="text"
//               placeholder="Nhập username..."
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               disabled={isLoading}
//             />
//           </div>

//           <div className="input-group">
//             <label>Mật khẩu</label>
//             <div className="password-field">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Nhập mật khẩu..."
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//               />
//               <span
//                 className="toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? "👁️" : "🙈"}
//               </span>
//             </div>
//           </div>

//           <button type="submit" className="login-btn" disabled={isLoading}>
//             {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
//           </button>

//           <p className="note">
//             Quên mật khẩu?
//             <button type="button" className="link-btn">
//               Khôi phục tại đây
//             </button>
//           </p>

//           <p className="signup-note">
//             Chưa có tài khoản?{" "}
//             <button type="button" className="link-btn" onClick={props.onSwitch}>
//               Đăng ký tại đây
//             </button>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;

import React, { useState } from "react";
import "./LoginPage.css";
import { FaUserCircle } from "react-icons/fa";
import { API_URL } from "../config/api";
import useAuth from "../useAuth";

function LoginPage({ onSwitch, onLoginSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (username.length < 3) {
      setError("Username phải có ít nhất 3 ký tự!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại!");
        return;
      }

      console.log("✅ Login response:", data);

      // Save to AuthContext
      login(data.user, data.token);

      console.log(`✅ Đăng nhập thành công! Chào mừng ${data.user.name}`);

      // Clear form
      setUsername("");
      setPassword("");

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Lỗi kết nối server. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <h1 className="main-title">HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>

      <div className="login-card">
        <div className="card-icon">
          <FaUserCircle />
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Nhập username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <p className="signup-note">
            Chưa có tài khoản?{" "}
            <button 
              type="button" 
              className="link-btn" 
              onClick={onSwitch}
              disabled={isLoading}
            >
              Đăng ký tại đây
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;