// import React, { useState } from "react";
// import "./RegisterPage.css";
// import { FaUserCircle } from "react-icons/fa";
// import { API_URL } from "../config/api";

// function RegisterPage(props) {
//   const [fullname, setFullname] = useState("");
//   const [username, setUsername] = useState(""); // email hoặc username
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // 🔹 STATE MỚI
//   const [role, setRole] = useState("student"); // mặc định sinh viên
//   const [roleCode, setRoleCode] = useState("");

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!fullname || !username || !password || !confirmPassword) {
//       return alert("Vui lòng nhập đầy đủ thông tin!");
//     }

//     if (password !== confirmPassword) {
//       return alert("Mật khẩu và nhập lại mật khẩu không khớp!");
//     }

//     // Kiểm tra mã vai trò nếu là giảng viên
//     if (role === "teacher" && roleCode.trim() === "") {
//       return alert("Vui lòng nhập mã vai trò giảng viên!");
//     }

//     // Nếu là sinh viên mà cố nhập mã thì chặn
//     if (role === "student" && roleCode.trim() !== "") {
//       return alert("Sinh viên không cần nhập mã vai trò!");
//     }

//     try {
//       // 🔹 Gọi API backend
//       const res = await fetch(`${API_URL}/api/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fullname,
//           username,
//           password,
//           role_name: role, // "teacher" hoặc "student"
//           invite_code_input: role === "teacher" ? roleCode : null,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         return alert(data.message); // backend trả lỗi nếu mã vai trò sai hoặc username tồn tại
//       }

//       alert(data.message); // đăng ký thành công
//       if (props.onSwitch) props.onSwitch(); // chuyển sang login
//     } catch (err) {
//       console.error(err);
//       alert("Lỗi server, vui lòng thử lại");
//     }
//   };

//   return (
//     <div className="register-wrapper">
//       <h1 className="main-title">HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>

//       <div className="register-card">
//         <div className="card-icon">
//           <FaUserCircle />
//         </div>

//         <form onSubmit={handleRegister} className="register-form">
//           <div className="input-group">
//             <label>Họ và tên</label>
//             <input
//               type="text"
//               placeholder="Nhập họ và tên..."
//               value={fullname}
//               onChange={(e) => setFullname(e.target.value)}
//             />
//           </div>

//           <div className="input-group">
//             <label>Email / Username</label>
//             <input
//               type="text"
//               placeholder="Nhập email hoặc username..."
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </div>

//           {/* 🔹 Chọn vai trò */}
//           <div className="input-group">
//             <label>Chọn vai trò</label>
//             <select value={role} onChange={(e) => setRole(e.target.value)}>
//               <option value="student">Sinh viên</option>
//               <option value="teacher">Giảng viên</option>
//             </select>
//           </div>

//           {/* 🔹 Hiển thị ô nhập mã vai trò nếu là giảng viên */}
//           {role === "teacher" && (
//             <div className="input-group">
//               <label>Mã vai trò (Giảng viên)</label>
//               <input
//                 type="text"
//                 placeholder="Nhập mã vai trò..."
//                 value={roleCode}
//                 onChange={(e) => setRoleCode(e.target.value)}
//               />
//             </div>
//           )}

//           <div className="input-group">
//             <label>Mật khẩu</label>
//             <div className="password-field">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Nhập mật khẩu..."
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               <span
//                 className="toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? "👁️" : "🙈"}
//               </span>
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Nhập lại mật khẩu</label>
//             <div className="password-field">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Nhập lại mật khẩu..."
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <button type="submit" className="register-btn">
//             Đăng ký
//           </button>

//           <p className="note">
//             Bạn đã có tài khoản?{" "}
//             <button className="link-btn" onClick={props.onSwitch}>
//               Đăng nhập tại đây
//             </button>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default RegisterPage;


import React, { useState } from "react";
import "./RegisterPage.css";
import { FaUserCircle } from "react-icons/fa";
import { API_URL } from "../config/api";

function RegisterPage({ onSwitch }) {
  // Form states
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [roleCode, setRoleCode] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================================
  // 🎯 Validation
  // ================================
  const validateForm = () => {
    // Required fields
    if (!fullname || !username || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return false;
    }

    // Fullname length
    if (fullname.trim().length < 3) {
      setError("Họ tên phải có ít nhất 3 ký tự!");
      return false;
    }

    // Username length
    if (username.length < 3) {
      setError("Username phải có ít nhất 3 ký tự!");
      return false;
    }

    // Email validation (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ!");
      return false;
    }

    // Phone validation (if provided)
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      setError("Số điện thoại phải có 10-11 số!");
      return false;
    }

    // Password strength
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không khớp!");
      return false;
    }

    // Teacher code validation
    if (role === "teacher" && !roleCode.trim()) {
      setError("Vui lòng nhập mã vai trò giảng viên!");
      return false;
    }

    return true;
  };

  // ================================
  // 📝 Handle Register
  // ================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          username,
          password,
          email: email || null,
          phone: phone || null,
          department: department || null,
          role_name: role,
          invite_code_input: role === "teacher" ? roleCode : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại!");
        return;
      }

      console.log("✅ Register success:", data);
      setSuccess("Đăng ký thành công! Chuyển sang trang đăng nhập...");

      // Reset form
      setFullname("");
      setUsername("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setPassword("");
      setConfirmPassword("");
      setRoleCode("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        if (onSwitch) onSwitch();
      }, 2000);

    } catch (err) {
      console.error("❌ Register error:", err);
      setError("Lỗi kết nối server. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <h1 className="main-title">HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN</h1>

      <div className="register-card">
        <div className="card-icon">
          <FaUserCircle />
        </div>

        <form onSubmit={handleRegister} className="register-form">
          {/* Error message */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          {/* Họ tên */}
          <div className="input-group">
            <label>Họ và tên <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nhập họ và tên đầy đủ..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Username */}
          <div className="input-group">
            <label>Username <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nhập username (dùng để đăng nhập)..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {/* Email (optional) */}
          <div className="input-group">
            <label>Email <span className="optional">(tùy chọn)</span></label>
            <input
              type="email"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Phone (optional) */}
          <div className="input-group">
            <label>Số điện thoại <span className="optional">(tùy chọn)</span></label>
            <input
              type="tel"
              placeholder="Nhập số điện thoại (10-11 số)..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Department (optional) */}
          <div className="input-group">
            <label>Khoa/Phòng <span className="optional">(tùy chọn)</span></label>
            <input
              type="text"
              placeholder="Nhập khoa/phòng ban..."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Role selection */}
          <div className="input-group">
            <label>Vai trò <span className="required">*</span></label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
            </select>
          </div>

          {/* Teacher code (conditional) */}
          {role === "teacher" && (
            <div className="input-group teacher-code">
              <label>
                Mã vai trò giảng viên <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập mã vai trò (liên hệ admin để lấy mã)..."
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
                disabled={isLoading}
              />
              <small className="hint">
                💡 Liên hệ quản trị viên để nhận mã vai trò giảng viên
              </small>
            </div>
          )}

          {/* Password */}
          <div className="input-group">
            <label>Mật khẩu <span className="required">*</span></label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
          </div>

          {/* Confirm password */}
          <div className="input-group">
            <label>Nhập lại mật khẩu <span className="required">*</span></label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="register-btn" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>

          {/* Login link */}
          <p className="note">
            Bạn đã có tài khoản?{" "}
            <button 
              type="button"
              className="link-btn" 
              onClick={onSwitch}
              disabled={isLoading}
            >
              Đăng nhập tại đây
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;