const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../src/models/Course');
const Class = require('../src/models/class');
const User = require('../src/models/User');

const testData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('=== KIỂM TRA DỮ LIỆU TRỰC TIẾP TRONG DATABASE ===');
    
    // Lấy một khóa học bất kỳ
    const course = await Course.findOne().lean();
    if (!course) {
      console.log('Không có khóa học nào trong database');
      return;
    }
    
    console.log(`\nKhóa học test: ${course.title} (ID: ${course._id})`);
    
    // Kiểm tra lớp học của khóa này
    const classes = await Class.find({ course: course._id })
      .populate('students', 'fullName')
      .populate('teacher', 'fullName');
    
    console.log(`Số lớp học: ${classes.length}`);
    
    if (classes.length > 0) {
      console.log('\nDanh sách lớp học:');
      classes.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.name}`);
        console.log(`   - Giảng viên: ${cls.teacher ? cls.teacher.fullName : 'Chưa có'}`);
        console.log(`   - Số học sinh: ${cls.students ? cls.students.length : 0}`);
        if (cls.students && cls.students.length > 0) {
          console.log(`   - Học sinh: ${cls.students.slice(0, 3).map(s => s.fullName).join(', ')}${cls.students.length > 3 ? '...' : ''}`);
        }
      });
    } else {
      console.log('Không có lớp học nào cho khóa học này');
    }
    
    // Test logic của courseManagementController
    console.log('\n=== TEST LOGIC CONTROLLER ===');
    const courseWithClasses = {
      ...course,
      classes: classes
    };
    
    console.log('Data được trả về cho view:');
    console.log(`- Course title: ${courseWithClasses.title}`);
    console.log(`- Classes array length: ${courseWithClasses.classes ? courseWithClasses.classes.length : 0}`);
    console.log(`- Condition (course.classes && course.classes.length > 0): ${courseWithClasses.classes && courseWithClasses.classes.length > 0}`);
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testData();
