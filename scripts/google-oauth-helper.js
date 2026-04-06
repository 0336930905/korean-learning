// Script để cập nhật cấu hình Google OAuth cho nhiều port
const fs = require('fs');
const path = require('path');

const PORTS_TO_SUPPORT = [3000, 3996, 3997, 3998, 3999, 4000, 5000];

// Tạo danh sách URI callback
const generateCallbackURIs = () => {
    return PORTS_TO_SUPPORT.map(port => `http://localhost:${port}/auth/google/callback`);
};

// Hiển thị thông tin cho Google Console
const displayGoogleConsoleInfo = () => {
    const currentPort = process.env.PORT || 3999;
    
    console.log('🔧 HƯỚNG DẪN CẬP NHẬT GOOGLE CLOUD CONSOLE');
    console.log('=' .repeat(60));
    console.log('');
    console.log('❗ QUAN TRỌNG: Bạn phải thêm URI vào Google Cloud Console!');
    console.log('');
    console.log('1. Truy cập: https://console.cloud.google.com/apis/credentials');
    console.log('2. Chọn project: 875597054714-e1v4icg0gisrliunj1tt499f7n66lmke');
    console.log('3. Click vào OAuth 2.0 Client ID');
    console.log('4. Thêm URI vào "Authorized redirect URIs":');
    console.log('');
    console.log(`   ✅ URI HIỆN TẠI CẦN THÊM:`);
    console.log(`   http://localhost:${currentPort}/auth/google/callback`);
    console.log('');
    console.log('5. Các URI khác nên thêm cho tương lai:');
    const uris = generateCallbackURIs();
    uris.forEach(uri => {
        if (!uri.includes(currentPort)) {
            console.log(`   ${uri}`);
        }
    });
    
    console.log('');
    console.log('6. Click SAVE và đợi 5-10 phút');
    console.log('');
    console.log('📱 THÔNG TIN HIỆN TẠI:');
    console.log(`   Port đang sử dụng: ${currentPort}`);
    console.log(`   Callback URI: http://localhost:${currentPort}/auth/google/callback`);
    console.log('');
    console.log('🚀 TÀI KHOẢN TEST (SỬ DỤNG NGAY):');
    console.log('   Admin: admin@test.com / admin123');
    console.log('   Teacher: teacher@test.com / teacher123');
    console.log('   Student: student@test.com / student123');
    console.log('');
    console.log('🔗 LINKS HỮUU ÍCH:');
    console.log(`   Login: http://localhost:${currentPort}/login`);
    console.log(`   Google Setup Guide: http://localhost:${currentPort}/test/google-setup`);
    console.log(`   Course Detail: http://localhost:${currentPort}/admin/course-management/testview/6887a7e5b3ec86c2b2ee9b58`);
    console.log(`   Google Console: https://console.cloud.google.com/apis/credentials`);
};

// Chạy script
require('dotenv').config();
displayGoogleConsoleInfo();
