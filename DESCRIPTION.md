# Description

## Tổng quan
**Language Learning Center Management System** là hệ thống quản lý trung tâm ngoại ngữ xây trên **Node.js + Express + MongoDB (Mongoose)**, dùng **EJS** cho giao diện, **Passport (Local/Google OAuth 2.0)** cho đăng nhập, và **Socket.IO** cho realtime.

## Tính năng chính (theo module)
- **Xác thực**: đăng nhập local + Google OAuth.
- **Quản trị**: quản lý hệ thống/tài khoản, báo cáo.
- **Học vụ**: quản lý khóa học/lớp học, bài tập, điểm danh.
- **Giáo viên / Học viên**: dashboard, nội dung học liệu, nhắn tin.

## Chạy dự án (local)
```bash
npm install
npm run dev
```

## Ghi chú Google OAuth (redirect_uri_mismatch)
- Callback thường dùng: `http://localhost:<PORT>/auth/google/callback`
- Tài liệu fix nhanh nằm ở:
  - `GOOGLE_OAUTH_FIX_URGENT.md`
  - `GOOGLE_OAUTH_FIX.md`
  - `OAUTH_QUICK_FIX.md`

## Lưu ý bảo mật
- **Không commit** file chứa secret như `.env` hoặc file mật khẩu (đã ignore trong `.gitignore`).
