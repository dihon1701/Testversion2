import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { API_URL } from "../config/api";

// SVG Icons tự tạo
const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const UserIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const BuildingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
    </svg>
);

const Navbar = ({
    onLogout,
    user,
    onShowTeachers,
    onShowStudents,
    onShowExamBank,
    onNavigateHome,
    onShowCreateExam,
    onUpdateUser
}) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        role: user?.role || ''
    });

    // Cập nhật editedUser khi user prop thay đổi
    useEffect(() => {
        if (user) {
            console.log('🔄 Navbar useEffect - User data:', user);
            setEditedUser({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department || '',
                role: user.role || ''
            });
        }
    }, [user]);

    // Hàm chuyển đổi role từ tiếng Anh sang tiếng Việt
    const getRoleDisplayName = (role) => {
        const roleMap = {
            'admin': 'Quản trị viên',
            'teacher': 'Giảng viên',
            'student': 'Sinh viên'
        };
        return roleMap[role?.toLowerCase()] || role || 'Chưa xác định';
    };

    const navItems = [
        { name: 'Trang chủ', link: '#', active: true, action: onNavigateHome },
        { name: 'Ngân hàng đề', link: '#', hasDropdown: true },
        { name: 'Tạo bài thi', link: '#', hasDropdown: true },
        { name: 'Danh sách', link: '#', hasDropdown: true },
        { name: 'Tài liệu', link: '#', hasDropdown: true },
    ];

    const handleOpenProfile = () => {
        console.log('🔓 Opening profile modal');
        console.log('User prop:', user);
        
        setShowProfileModal(true);
        setIsEditing(false);
        
        if (user) {
            setEditedUser({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department || '',
                role: user.role || ''
            });
        }
    };

    const handleCloseProfile = () => {
        console.log('🔒 Closing profile modal');
        setShowProfileModal(false);
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`✏️ Input changed: ${name} = ${value}`);
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        console.log('💾 ========== BẮT ĐẦU LƯU THÔNG TIN ==========');
        
        // Validate
        if (!editedUser.name || !editedUser.email) {
            console.error('❌ Validation failed: Thiếu họ tên hoặc email');
            alert('Họ tên và email là bắt buộc!');
            return;
        }

        console.log('✅ Validation passed');
        console.log('📦 Data to save:', {
            name: editedUser.name,
            email: editedUser.email,
            phone: editedUser.phone,
            department: editedUser.department
        });

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            console.log('🔑 Token exists:', token ? 'YES' : 'NO');
            console.log('🔑 Token value:', token ? token.substring(0, 50) + '...' : 'null');
            
            if (!token) {
                console.error('❌ No token found in localStorage');
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
                setIsLoading(false);
                return;
            }

            const requestBody = {
                name: editedUser.name,
                email: editedUser.email,
                phone: editedUser.phone,
                department: editedUser.department
            };

            console.log('📤 Sending PUT request to: ${API_URL}/api/auth/profile');
            console.log('📤 Request headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.substring(0, 20)}...`
            });
            console.log('📤 Request body:', requestBody);

            const response = await fetch('${API_URL}/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response status:', response.status, response.statusText);

            const data = await response.json();
            console.log('📥 Response data:', data);

            if (response.ok) {
                console.log('✅ API call successful!');
                
                // Cập nhật thông tin user trong component cha
                if (onUpdateUser) {
                    console.log('📢 Calling onUpdateUser callback with:', data.user);
                    onUpdateUser(data.user);
                } else {
                    console.warn('⚠️ onUpdateUser callback is not defined!');
                }
                
                // Cập nhật localStorage
                const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
                const updatedUserData = {
                    ...currentUserData,
                    ...data.user
                };
                
                console.log('💾 Updating localStorage with:', updatedUserData);
                localStorage.setItem('userData', JSON.stringify(updatedUserData));
                console.log('✅ localStorage updated successfully');

                setIsEditing(false);
                alert('Cập nhật thông tin thành công!');
                console.log('💾 ========== KẾT THÚC LƯU THÔNG TIN ==========');
            } else {
                console.error('❌ API returned error:', data.message);
                alert(data.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
            }
        } catch (error) {
            console.error('❌ Exception occurred:', error);
            console.error('❌ Error stack:', error.stack);
            alert('Không thể kết nối đến server. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
            console.log('🏁 Request completed');
        }
    };

    const handleCancelEdit = () => {
        console.log('❌ Cancel edit');
        
        if (user) {
            setEditedUser({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department || '',
                role: user.role || ''
            });
        }
        setIsEditing(false);
    };

    return (
        <>
            <nav className="navbar-container system-navbar">
                <div className="navbar-content">
                    {/* Logo */}
                    <div className="navbar-logo" onClick={onNavigateHome}>
                        <span className="logo-color">HEART</span>
                        <span className="logo-secondary">STEEL</span>
                    </div>

                    {/* Menu */}
                    <div className="navbar-menu">
                        {navItems.map((item) => (
                            <div key={item.name} className="navbar-item-wrapper">
                                <a
                                    href={item.link}
                                    className={`navbar-item ${item.active ? 'active' : ''}`}
                                    onClick={(e) => {
                                        if (item.action) {
                                            e.preventDefault();
                                            item.action();
                                        }
                                    }}
                                >
                                    {item.name}
                                    {item.hasDropdown && <span className="dropdown-arrow"><ChevronDownIcon /></span>}
                                </a>

                                {/* Dropdown Danh sách */}
                                {item.name === "Danh sách" && (
                                    <div className="dropdown-menu">
                                        <a href="#" className="dropdown-item" onClick={onShowTeachers}>
                                            Giảng viên
                                        </a>
                                        <a href="#" className="dropdown-item" onClick={onShowStudents}>
                                            Sinh viên
                                        </a>
                                    </div>
                                )}

                                {/* Dropdown Ngân hàng đề */}
                                {item.name === "Ngân hàng đề" && (
                                    <div className="dropdown-menu">
                                        <a
                                            href="#"
                                            className="dropdown-item"
                                            onClick={() => onShowExamBank("tracnghiem")}
                                        >
                                            Trắc nghiệm
                                        </a>
                                    </div>
                                )}

                                {/* Dropdown Tạo bài thi */}
                                {item.name === "Tạo bài thi" && (
                                    <div className="dropdown-menu">
                                        <a
                                            href="#"
                                            className="dropdown-item"
                                            onClick={() => onShowCreateExam("tracnghiem")}
                                        >
                                            Trắc nghiệm
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Nút logout và Settings */}
                    <div className="navbar-actions">
                        <button className="btn-start-study btn-system-login" onClick={onLogout}>
                            Đăng xuất
                        </button>
                        <div 
                            className="user-icon system-icon" 
                            onClick={handleOpenProfile}
                            style={{ cursor: 'pointer' }}
                            title="Cài đặt tài khoản"
                        >
                            ⚙️
                        </div>
                    </div>
                </div>
            </nav>

            {/* Modal Thông tin Người dùng */}
            {showProfileModal && (
                <div className="profile-modal-overlay" onClick={handleCloseProfile}>
                    <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h2>Thông tin cá nhân</h2>
                            <button className="close-btn" onClick={handleCloseProfile}>
                                <XIcon />
                            </button>
                        </div>

                        <div className="profile-modal-body">
                            <div className="profile-avatar">
                                <div className="avatar-circle">
                                    {editedUser.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            <div className="profile-form">
                                <div className="form-group">
                                    <label>
                                        <span className="input-icon"><UserIcon /></span>
                                        Họ và tên <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedUser.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={!isEditing ? 'disabled' : ''}
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="input-icon"><MailIcon /></span>
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedUser.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={!isEditing ? 'disabled' : ''}
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="input-icon"><PhoneIcon /></span>
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editedUser.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={!isEditing ? 'disabled' : ''}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <span className="input-icon"><BuildingIcon /></span>
                                        Khoa/Bộ môn
                                    </label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={editedUser.department}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={!isEditing ? 'disabled' : ''}
                                        placeholder="Nhập khoa/bộ môn"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Vai trò</label>
                                    <input
                                        type="text"
                                        value={getRoleDisplayName(editedUser.role)}
                                        disabled
                                        className="disabled"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="profile-modal-footer">
                            {!isEditing ? (
                                <button 
                                    className="btn-edit"
                                    onClick={() => {
                                        console.log('✏️ Entering edit mode');
                                        setIsEditing(true);
                                    }}
                                >
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <>
                                    <button 
                                        className="btn-cancel"
                                        onClick={handleCancelEdit}
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        className="btn-save"
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .profile-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .profile-modal-content {
                    background: white;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }

                .profile-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .profile-modal-header h2 {
                    margin: 0;
                    font-size: 24px;
                    color: #1f2937;
                }

                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                    border-radius: 4px;
                }

                .close-btn:hover {
                    color: #1f2937;
                    background: #f3f4f6;
                }

                .profile-modal-body {
                    padding: 24px;
                }

                .profile-avatar {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 24px;
                }

                .avatar-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    font-weight: bold;
                }

                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .required {
                    color: #ef4444;
                }

                .input-icon {
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                }

                .form-group input {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-group input.disabled {
                    background-color: #f9fafb;
                    color: #6b7280;
                    cursor: not-allowed;
                }

                .profile-modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .btn-edit, .btn-save, .btn-cancel {
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-edit {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-edit:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .btn-save {
                    background: #10b981;
                    color: white;
                }

                .btn-save:hover:not(:disabled) {
                    background: #059669;
                }

                .btn-save:disabled, .btn-cancel:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-cancel {
                    background: #f3f4f6;
                    color: #374151;
                }

                .btn-cancel:hover:not(:disabled) {
                    background: #e5e7eb;
                }
            `}</style>
        </>
    );
};

export default Navbar;

