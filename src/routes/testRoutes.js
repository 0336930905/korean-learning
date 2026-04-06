const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');

// Route hiển thị hướng dẫn sửa lỗi Google OAuth mới
router.get('/google-oauth-fix', (req, res) => {
    res.sendFile(path.join(__dirname, '../../google-oauth-fix.html'));
});

// Route hiển thị hướng dẫn khắc phục Google OAuth
router.get('/oauth-fix', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/oauth-fix-guide.html'));
});

// Route hiển thị hướng dẫn cập nhật Google Console
router.get('/google-setup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../views/google-oauth-setup.html'));
});

// Tạo admin account test
router.get('/create-test-admin', async (req, res) => {
    try {
        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (existingAdmin) {
            return res.json({ 
                message: 'Admin account already exists',
                credentials: {
                    email: 'admin@test.com',
                    password: 'admin123'
                }
            });
        }

        // Tạo admin mới
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = new User({
            fullName: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            emailVerified: true
        });

        await adminUser.save();

        res.json({
            message: 'Test admin account created successfully!',
            credentials: {
                email: 'admin@test.com',
                password: 'admin123'
            },
            loginUrl: 'http://localhost:4000/login'
        });

    } catch (error) {
        console.error('Error creating test admin:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tạo teacher account test
router.get('/create-test-teacher', async (req, res) => {
    try {
        const existingTeacher = await User.findOne({ email: 'teacher@test.com' });
        if (existingTeacher) {
            return res.json({ 
                message: 'Teacher account already exists',
                credentials: {
                    email: 'teacher@test.com',
                    password: 'teacher123'
                }
            });
        }

        const hashedPassword = await bcrypt.hash('teacher123', 10);
        const teacherUser = new User({
            fullName: 'Test Teacher',
            email: 'teacher@test.com',
            password: hashedPassword,
            role: 'teacher',
            isActive: true,
            emailVerified: true
        });

        await teacherUser.save();

        res.json({
            message: 'Test teacher account created successfully!',
            credentials: {
                email: 'teacher@test.com',
                password: 'teacher123'
            },
            loginUrl: 'http://localhost:4000/login'
        });

    } catch (error) {
        console.error('Error creating test teacher:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tạo student account test
router.get('/create-test-student', async (req, res) => {
    try {
        const existingStudent = await User.findOne({ email: 'student@test.com' });
        if (existingStudent) {
            return res.json({ 
                message: 'Student account already exists',
                credentials: {
                    email: 'student@test.com',
                    password: 'student123'
                }
            });
        }

        const hashedPassword = await bcrypt.hash('student123', 10);
        const studentUser = new User({
            fullName: 'Test Student',
            email: 'student@test.com',
            password: hashedPassword,
            role: 'student',
            isActive: true,
            emailVerified: true
        });

        await studentUser.save();

        res.json({
            message: 'Test student account created successfully!',
            credentials: {
                email: 'student@test.com',
                password: 'student123'
            },
            loginUrl: 'http://localhost:4000/login'
        });

    } catch (error) {
        console.error('Error creating test student:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
