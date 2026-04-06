# 🔥 KHẮC PHỤC GOOGLE OAUTH - HƯỚNG DẪN NHANH

## ⚡ THÔNG TIN QUAN TRỌNG
- **Port hiện tại**: 3998
- **URL ứng dụng**: http://localhost:3998
- **Callback URI cần thêm**: `http://localhost:3998/auth/google/callback`

## 🎯 CÁCH KHẮC PHỤC NHANH NHẤT

### Bước 1: Mở Google Cloud Console
```
https://console.cloud.google.com/
```

### Bước 2: Chọn project
Project ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`

### Bước 3: Vào Credentials
APIs & Services → Credentials → OAuth 2.0 Client IDs

### Bước 4: Edit và thêm URI
Thêm vào "Authorized redirect URIs":
```
http://localhost:3998/auth/google/callback
```

### Bước 5: Lưu và đợi
Click SAVE → Đợi 10 phút → Test lại

## 🚀 SỬ DỤNG NGAY (KHÔNG CẦN GOOGLE OAUTH)

### Tài khoản Admin
- Email: `admin@test.com`
- Password: `admin123`

### Tài khoản Teacher  
- Email: `teacher@test.com`
- Password: `teacher123`

### Tài khoản Student
- Email: `student@test.com`
- Password: `student123`

## 🔗 LINKS QUAN TRỌNG

| Chức năng | URL |
|-----------|-----|
| 🔑 Đăng nhập | http://localhost:3998/login |
| 📚 Course Detail | http://localhost:3998/admin/course-management/testview/6887a7e5b3ec86c2b2ee9b58 |
| 🛠️ Hướng dẫn OAuth | http://localhost:3998/test/oauth-fix |
| ☁️ Google Console | https://console.cloud.google.com/ |

## ✅ KIỂM TRA ĐÃ HOÀN THÀNH

- [ ] Truy cập Google Cloud Console
- [ ] Chọn đúng project  
- [ ] Vào APIs & Services > Credentials
- [ ] Edit OAuth 2.0 Client
- [ ] Thêm URI: `http://localhost:3998/auth/google/callback`
- [ ] Click SAVE
- [ ] Đợi 10 phút
- [ ] Test Google login

## 🆘 NẾU VẪN LỖI

1. **Xóa cache trình duyệt** và thử lại
2. **Dùng tài khoản admin test** để tiếp tục development
3. **Liên hệ owner** của Google Cloud project để được cấp quyền

---
*💡 Tip: Có thể dùng tài khoản admin@test.com để test ngay mà không cần chờ Google OAuth*
