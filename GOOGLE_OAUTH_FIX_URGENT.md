# 🚨 KHẮC PHỤC LỖI GOOGLE OAUTH - NGAY LẬP TỨC

## ⚡ THÔNG TIN QUAN TRỌNG
- **Port hiện tại**: 3999
- **URI cần thêm**: `http://localhost:3999/auth/google/callback`
- **Project ID**: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke

## 🎯 CÁCH KHẮC PHỤC NHANH (3-5 phút)

### 📋 CHECKLIST THỰC HIỆN:

#### ✅ Bước 1: Mở Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

#### ✅ Bước 2: Chọn đúng project
```
Project ID: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke
```

#### ✅ Bước 3: Tìm OAuth 2.0 Client
Tìm client có ID: `875597054714-e1v4icg0gisrliunj1tt499f7n66lmke`

#### ✅ Bước 4: Thêm URI chuyển hướng
Trong "Authorized redirect URIs", click **"+ ADD URI"** và thêm:
```
http://localhost:3999/auth/google/callback
```

#### ✅ Bước 5: Lưu và đợi
- Click **SAVE**
- Đợi **5-10 phút** để Google cập nhật
- Test lại Google login

## 🚀 SỬ DỤNG NGAY - KHÔNG CẦN GOOGLE OAUTH

### Tài khoản test đã sẵn sàng:

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@test.com` | `admin123` |
| 🎓 **Teacher** | `teacher@test.com` | `teacher123` |
| 📚 **Student** | `student@test.com` | `student123` |

## 🔗 LINKS QUAN TRỌNG

| Chức năng | URL |
|-----------|-----|
| 🔑 **Đăng nhập** | http://localhost:3999/login |
| 🛠️ **Hướng dẫn Google** | http://localhost:3999/test/google-setup |
| 📚 **Course Detail** | http://localhost:3999/admin/course-management/testview/6887a7e5b3ec86c2b2ee9b58 |
| ☁️ **Google Console** | https://console.cloud.google.com/apis/credentials |

## 📱 THÔNG TIN KỸ THUẬT

```bash
# Thông tin server
Port: 3999
URL: http://localhost:3999

# OAuth Callback
URI: http://localhost:3999/auth/google/callback

# Project thông tin
Client ID: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke.apps.googleusercontent.com
Project ID: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke
```

## 🆘 NẾU VẪN KHÔNG ĐƯỢC

### Option 1: Dùng tài khoản test
Đăng nhập bằng **admin@test.com / admin123** để tiếp tục development

### Option 2: Xóa cache trình duyệt
1. Mở Developer Tools (F12)
2. Right-click nút Refresh → Empty Cache and Hard Reload

### Option 3: Liên hệ admin
Yêu cầu owner của Google Cloud project cấp quyền chỉnh sửa Credentials

---

## 💡 TIPS

- **URI phải chính xác 100%** - không có dấu cách hay ký tự thừa
- **Đợi đủ thời gian** - Google cần 5-10 phút để cập nhật
- **Test bằng tài khoản admin** - Không cần chờ Google OAuth để development

---

*🎉 Sau khi cập nhật Google Console, Google OAuth sẽ hoạt động bình thường!*
