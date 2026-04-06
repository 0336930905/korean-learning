# HƯỚNG DẪN KHẮC PHỤC LỖI GOOGLE OAUTH "redirect_uri_mismatch"

## 🔴 VẤN ĐỀ HIỆN TẠI:
```
Lỗi 400: redirect_uri_mismatch
Bạn không đăng nhập được vì ứng dụng này đã gửi một yêu cầu không hợp lệ.
```

## ✅ GIẢI PHÁP CHI TIẾT:

### BƯỚC 1: Truy cập Google Cloud Console
1. Mở trình duyệt và đăng nhập: https://console.cloud.google.com/
2. Đảm bảo bạn đăng nhập với tài khoản Google có quyền quản lý project

### BƯỚC 2: Chọn Project
1. Ở góc trên bên trái, click vào dropdown chọn project
2. Tìm và chọn project có Client ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`

### BƯỚC 3: Vào APIs & Services
1. Ở menu bên trái, click "APIs & Services"
2. Click "Credentials"

### BƯỚC 4: Chỉnh sửa OAuth 2.0 Client
1. Trong danh sách "OAuth 2.0 Client IDs", tìm client có ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`
2. Click vào tên client để mở trang chỉnh sửa

### BƯỚC 5: Thêm Authorized redirect URIs
Trong phần "Authorized redirect URIs", thêm các URI sau:

```
http://localhost:3996/auth/google/callback
http://localhost:3997/auth/google/callback
http://localhost:3998/auth/google/callback
http://localhost:4000/auth/google/callback
http://localhost:5000/auth/google/callback
```

**URI hiện tại đang sử dụng:**
```
http://localhost:3998/auth/google/callback
```

### BƯỚC 6: Lưu thay đổi
1. Click nút "SAVE" ở cuối trang
2. Đợi 5-10 phút để Google cập nhật cấu hình

### BƯỚC 7: Test lại Google OAuth
1. Vào: http://localhost:3998/login
2. Click nút "Sign in with Google"
3. Xem lỗi đã được khắc phục chưa

## 🚀 GIẢI PHÁP TẠM THỜI (SỬ DỤNG NGAY):

### Tài khoản test đã tạo sẵn:
- **Admin**: admin@test.com / admin123
- **Teacher**: teacher@test.com / teacher123
- **Student**: student@test.com / student123

### Links hữu ích:
- **Login**: http://localhost:3998/login
- **Test Course Detail**: http://localhost:3998/admin/course-management/testview/6887a7e5b3ec86c2b2ee9b58

## 📋 CHECKLIST KHẮC PHỤC:

- [ ] Truy cập Google Cloud Console
- [ ] Chọn đúng project (875597054714-e1v4icg0gisrliunj1tt499f7n66lmke)
- [ ] Vào APIs & Services > Credentials
- [ ] Chỉnh sửa OAuth 2.0 Client
- [ ] Thêm URI: `http://localhost:3998/auth/google/callback`
- [ ] Lưu thay đổi
- [ ] Đợi 5-10 phút
- [ ] Test lại Google login

## 📱 THÔNG TIN TECHNICAL:

### Cấu hình hiện tại:
```
Port: 3998
Callback URL: http://localhost:3998/auth/google/callback
Client ID: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke.apps.googleusercontent.com
```

### File cần kiểm tra:
- `src/config/passport.js` - Cấu hình OAuth callback
- `.env` - Port và client credentials

## ⚠️ LƯU Ý QUAN TRỌNG:

1. **Phải có quyền admin** của Google Cloud project
2. **Đợi đủ thời gian** (5-10 phút) để Google cập nhật
3. **Xóa cache trình duyệt** nếu vẫn lỗi
4. **Kiểm tra chính tả** URI phải chính xác 100%

## 🔧 NẾU VẪN LỖI:

### Option 1: Tạo OAuth Client mới
1. Trong Google Console, tạo OAuth 2.0 Client ID mới
2. Cập nhật GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env

### Option 2: Sử dụng tài khoản test
- Tiếp tục dùng admin@test.com / admin123 để development

### Option 3: Liên hệ admin Google Cloud
- Yêu cầu quyền chỉnh sửa project từ owner
