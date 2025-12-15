import React, { useState } from "react";
import "./RegisterPage.css";
import { FaUserCircle } from "react-icons/fa";
import { API_URL } from "../config/api";

function RegisterPage(props) {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState(""); // email hoặc username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 STATE MỚI
  const [role, setRole] = useState("student"); // mặc định sinh viên
  const [roleCode, setRoleCode] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullname || !username || !password || !confirmPassword) {
      return alert("Vui lòng nhập đầy đủ thông tin!");
    }

    if (password !== confirmPassword) {
      return alert("Mật khẩu và nhập lại mật khẩu không khớp!");
    }

    // Kiểm tra mã vai trò nếu là giảng viên
    if (role === "teacher" && roleCode.trim() === "") {
      return alert("Vui lòng nhập mã vai trò giảng viên!");
    }

    // Nếu là sinh viên mà cố nhập mã thì chặn
    if (role === "student" && roleCode.trim() !== "") {
      return alert("Sinh viên không cần nhập mã vai trò!");
    }

    try {
      // 🔹 Gọi API backend
      const res = await fetch("${API_URL}/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          username,
          password,
          role_name: role, // "teacher" hoặc "student"
          invite_code_input: role === "teacher" ? roleCode : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message); // backend trả lỗi nếu mã vai trò sai hoặc username tồn tại
      }

      alert(data.message); // đăng ký thành công
      if (props.onSwitch) props.onSwitch(); // chuyển sang login
    } catch (err) {
      console.error(err);
      alert("Lỗi server, vui lòng thử lại");
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
          <div className="input-group">
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nhập họ và tên..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email / Username</label>
            <input
              type="text"
              placeholder="Nhập email hoặc username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* 🔹 Chọn vai trò */}
          <div className="input-group">
            <label>Chọn vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
            </select>
          </div>

          {/* 🔹 Hiển thị ô nhập mã vai trò nếu là giảng viên */}
          {role === "teacher" && (
            <div className="input-group">
              <label>Mã vai trò (Giảng viên)</label>
              <input
                type="text"
                placeholder="Nhập mã vai trò..."
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Nhập lại mật khẩu</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="register-btn">
            Đăng ký
          </button>

          <p className="note">
            Bạn đã có tài khoản?{" "}
            <button className="link-btn" onClick={props.onSwitch}>
              Đăng nhập tại đây
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;