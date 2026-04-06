const express = require('express');
const router = express.Router();
const courseManagementController = require('../controllers/courseManagementController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/courses');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Thêm route mới cho trang chính
router.get('/', courseManagementController.getManagePage);

// Thêm route test hiển thị courseDetail với dữ liệu thật
router.get('/testview/:id', async (req, res) => {
    try {
        const Course = require('../models/Course');
        const Class = require('../models/class');
        
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'fullName email');
        
        if (!course) {
            return res.status(404).render('error', { 
                message: 'Không tìm thấy khóa học',
                user: { role: 'admin', fullName: 'Test Admin' }
            });
        }
        
        const classes = await Class.find({ course: req.params.id })
            .populate('students', 'fullName email')
            .populate('teacher', 'fullName')
            .sort({ createdAt: -1 });
        
        res.render('admin/courseDetail', { 
            course: {
                ...course.toObject(),
                classes: classes
            },
            user: { role: 'admin', fullName: 'Test Admin' }
        });
    } catch (error) {
        console.error('Test view error:', error);
        res.status(500).render('error', { 
            message: 'Lỗi server khi tải chi tiết khóa học',
            user: { role: 'admin', fullName: 'Test Admin' }
        });
    }
});

// Thêm route test không cần auth
router.get('/test/:id', async (req, res) => {
    try {
        const Course = require('../models/Course');
        const Class = require('../models/class');
        
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'fullName email');
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const classes = await Class.find({ course: req.params.id })
            .populate('students', 'fullName email')
            .populate('teacher', 'fullName')
            .sort({ createdAt: -1 });
        
        res.json({
            course: course.toObject(),
            classes: classes,
            classCount: classes.length,
            debug: {
                hasCourse: !!course,
                hasClasses: classes.length > 0,
                condition: classes && classes.length > 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Giữ nguyên các route hiện tại
router.get('/manage', courseManagementController.getManagePage);
router.get('/:id', courseManagementController.getCourseDetail);
router.post('/create', upload.single('image'), courseManagementController.createCourse);
router.put('/update/:id', upload.single('image'), courseManagementController.updateCourse);
router.delete('/delete/:id', courseManagementController.deleteCourse);

module.exports = router;