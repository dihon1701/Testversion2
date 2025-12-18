// // import jwt from "jsonwebtoken";

// // export const verifyToken = (req, res, next) => {
// //     const header = req.headers.authorization;
// //     if (!header) return res.status(401).json({ message: "Thiếu token" });

// //     const token = header.split(" ")[1];

// //     try {
// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //         req.user = decoded; 
// //         next();
// //     } catch (err) {
// //         return res.status(403).json({ message: "Token không hợp lệ" });
// //     }
// // };

// // export const allowTeacherOrAdmin = (req, res, next) => {
// //     if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

// //     if (req.user.role !== "admin" && req.user.role !== "teacher") {
// //         return res.status(403).json({ message: "Bạn không có quyền tạo đề thi" });
// //     }

// //     next();
// // };


// import jwt from "jsonwebtoken";

// // ========================
// // Middleware: Xác thực token
// // ========================
// export const verifyToken = (req, res, next) => {
//     const header = req.headers.authorization;
//     if (!header) return res.status(401).json({ message: "Thiếu token" });

//     const token = header.split(" ")[1];

//     try {
//         const decoded = jwt.verify(
//             token, 
//             process.env.JWT_SECRET || "SECRET_KEY_CHANGE_IN_PRODUCTION"
//         );
//         req.user = decoded; 
//         next();
//     } catch (err) {
//         return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
//     }
// };

// // ========================
// // Middleware: Chỉ cho phép Teacher và Admin
// // ========================
// export const allowTeacherOrAdmin = (req, res, next) => {
//     if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

//     if (req.user.role !== "admin" && req.user.role !== "teacher") {
//         return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
//     }

//     next();
// };

// // ========================
// // Middleware: Chỉ cho phép Admin
// // ========================
// export const allowAdminOnly = (req, res, next) => {
//     if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

//     if (req.user.role !== "admin") {
//         return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
//     }

//     next();
// };

// // ========================
// // Middleware: Chỉ cho phép Student
// // ========================
// export const allowStudentOnly = (req, res, next) => {
//     if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

//     if (req.user.role !== "student") {
//         return res.status(403).json({ message: "Chỉ sinh viên mới có quyền truy cập" });
//     }

//     next();
// };

import jwt from "jsonwebtoken";

// ========================
// Middleware: Xác thực token với error handling tốt hơn
// ========================
export const verifyToken = (req, res, next) => {
    try {
        // Kiểm tra header Authorization
        const header = req.headers.authorization;
        
        if (!header) {
            return res.status(401).json({ 
                success: false,
                message: "Thiếu token xác thực" 
            });
        }

        // Kiểm tra format "Bearer <token>"
        const parts = header.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ 
                success: false,
                message: "Format token không hợp lệ. Sử dụng: Bearer <token>" 
            });
        }

        const token = parts[1];

        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || "SECRET_KEY_CHANGE_IN_PRODUCTION"
        );

        // Kiểm tra token có đầy đủ thông tin không
        if (!decoded.id || !decoded.username || !decoded.role) {
            return res.status(403).json({ 
                success: false,
                message: "Token thiếu thông tin bắt buộc" 
            });
        }

        // Gán user vào request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        next();

    } catch (err) {
        console.error("❌ Token verification error:", err.message);

        // Phân biệt các loại lỗi
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false,
                message: "Token đã hết hạn, vui lòng đăng nhập lại",
                code: "TOKEN_EXPIRED"
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({ 
                success: false,
                message: "Token không hợp lệ",
                code: "TOKEN_INVALID"
            });
        }

        return res.status(500).json({ 
            success: false,
            message: "Lỗi xác thực token"
        });
    }
};

// ========================
// Middleware: Verify role (Flexible approach)
// ========================
export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Đảm bảo đã qua verifyToken
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Chưa xác thực. Vui lòng đăng nhập" 
            });
        }

        // Kiểm tra role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Bạn không có quyền truy cập chức năng này",
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

// ========================
// Middleware shortcuts cho các role cụ thể
// ========================

export const allowAdminOnly = (req, res, next) => {
    return verifyRole("admin")(req, res, next);
};

export const allowTeacherOrAdmin = (req, res, next) => {
    return verifyRole("admin", "teacher")(req, res, next);
};

export const allowStudentOnly = (req, res, next) => {
    return verifyRole("student")(req, res, next);
};

export const allowAnyAuthenticated = (req, res, next) => {
    // Chỉ cần đã login, không cần check role
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: "Vui lòng đăng nhập để tiếp tục" 
        });
    }
    next();
};

// ========================
// Middleware: Optional auth (không bắt buộc đăng nhập)
// ========================
export const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    
    if (!header) {
        req.user = null;
        return next();
    }

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || "SECRET_KEY_CHANGE_IN_PRODUCTION"
        );
        req.user = decoded;
    } catch (err) {
        req.user = null;
    }

    next();
};

// ========================
// Middleware: Check ownership (user chỉ access data của mình)
// ========================
export const checkOwnership = (userIdParam = "userId") => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Chưa xác thực" 
            });
        }

        // Admin có thể truy cập tất cả
        if (req.user.role === "admin") {
            return next();
        }

        // Lấy userId từ params hoặc body
        const targetUserId = req.params[userIdParam] || req.body[userIdParam];
        
        if (!targetUserId) {
            return res.status(400).json({ 
                success: false,
                message: "Thiếu thông tin userId" 
            });
        }

        // Kiểm tra ownership
        if (parseInt(targetUserId) !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: "Bạn chỉ có thể truy cập dữ liệu của chính mình" 
            });
        }

        next();
    };
};

// ========================
// Middleware: Rate limiting per user
// ========================
const userRequestCounts = new Map();

export const rateLimitPerUser = (maxRequests = 100, windowMs = 60000) => {
    return (req, res, next) => {
        if (!req.user) return next();

        const userId = req.user.id;
        const now = Date.now();
        const userKey = `user_${userId}`;

        if (!userRequestCounts.has(userKey)) {
            userRequestCounts.set(userKey, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const userData = userRequestCounts.get(userKey);

        // Reset nếu hết window
        if (now > userData.resetTime) {
            userData.count = 1;
            userData.resetTime = now + windowMs;
            return next();
        }

        // Tăng count
        userData.count++;

        // Check limit
        if (userData.count > maxRequests) {
            const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
            return res.status(429).json({
                success: false,
                message: "Quá nhiều request. Vui lòng thử lại sau",
                retryAfter
            });
        }

        next();
    };
};

// Cleanup rate limit cache mỗi 5 phút
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of userRequestCounts.entries()) {
        if (now > data.resetTime) {
            userRequestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);

export default {
    verifyToken,
    verifyRole,
    allowAdminOnly,
    allowTeacherOrAdmin,
    allowStudentOnly,
    allowAnyAuthenticated,
    optionalAuth,
    checkOwnership,
    rateLimitPerUser
};