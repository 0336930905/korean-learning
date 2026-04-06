# Hướng dẫn sửa lỗi Google OAuth "redirect_uri_mismatch"

## Vấn đề:
Lỗi 400: redirect_uri_mismatch xảy ra khi redirect URI trong ứng dụng không khớp với cấu hình trong Google Cloud Console.

## ✅ GIẢI PHÁP ĐÃ THỰC HIỆN:

### 1. Cập nhật passport.js:
- Đã sửa callbackURL để tự động thích ứng với port hiện tại
- Hỗ trợ cả development và production environment

### 2. Tạo tài khoản test để bypass Google OAuth:
- **Admin**: email: `admin@test.com`, password: `admin123`
- **Teacher**: email: `teacher@test.com`, password: `teacher123`
- **Student**: email: `student@test.com`, password: `student123`

### 3. Routes tạo tài khoản test:
- http://localhost:4000/test/create-test-admin
- http://localhost:4000/test/create-test-teacher
- http://localhost:4000/test/create-test-student

## 🔧 ĐỂ SỬA HOÀN TOÀN GOOGLE OAUTH:

### Bước 1: Truy cập Google Cloud Console
1. Đăng nhập: https://console.cloud.google.com/
2. Chọn project có Client ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`

### Bước 2: Cập nhật OAuth 2.0 Client IDs
1. Vào "APIs & Services" > "Credentials"
2. Tìm OAuth 2.0 Client ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`
3. Click để edit

### Bước 3: Thêm Authorized redirect URIs
Thêm các URI sau vào "Authorized redirect URIs":
```
http://localhost:3000/auth/google/callback
http://localhost:3996/auth/google/callback
http://localhost:4000/auth/google/callback
http://localhost:5000/auth/google/callback
```

### Bước 4: Lưu và đợi
- Click "Save"
- Đợi 5-10 phút để Google cập nhật

## 🚀 CÁCH SỬ DỤNG HIỆN TẠI:

### Đăng nhập bằng tài khoản test:
1. Vào: http://localhost:4000/login
2. Dùng thông tin đăng nhập:
   - **Admin**: admin@test.com / admin123
   - **Teacher**: teacher@test.com / teacher123
   - **Student**: student@test.com / student123

### Test trang admin course detail:
1. Đăng nhập bằng admin@test.com
2. Vào: http://localhost:4000/admin/course-management
3. Chọn một khóa học để xem chi tiết

### Test trực tiếp (không cần đăng nhập):
- http://localhost:4000/admin/course-management/testview/6887a7e5b3ec86c2b2ee9b58

## 📝 URI HIỆN TẠI:
- Development: `http://localhost:4000/auth/google/callback`
- Production: Cần cập nhật domain thật

## ⚠️ LƯU Ý:
- Sau khi cập nhật Google Console, Google OAuth sẽ hoạt động bình thường
- Có thể tiếp tục dùng tài khoản test để development
- Khi deploy production, cần cập nhật domain trong Google Console
