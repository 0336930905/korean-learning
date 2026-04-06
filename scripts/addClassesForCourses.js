const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Class = require('../src/models/class');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hàm tạo ngày bắt đầu và kết thúc ngẫu nhiên
const generateRandomDates = () => {
  const today = new Date();
  const startDateOffset = Math.floor(Math.random() * 30) + 1; // 1-30 ngày từ hôm nay
  const duration = Math.floor(Math.random() * 60) + 30; // 30-90 ngày
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + startDateOffset);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration);
  
  return { startDate, endDate };
};

// Hàm tạo lịch học ngẫu nhiên
const generateRandomSchedule = () => {
  const allDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const times = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '19:00-21:00'];
  
  // Chọn 2-3 ngày trong tuần
  const numDays = Math.floor(Math.random() * 2) + 2; // 2 hoặc 3 ngày
  const selectedDays = [];
  
  for (let i = 0; i < numDays; i++) {
    let randomDay;
    do {
      randomDay = allDays[Math.floor(Math.random() * allDays.length)];
    } while (selectedDays.includes(randomDay));
    selectedDays.push(randomDay);
  }
  
  const randomTime = times[Math.floor(Math.random() * times.length)];
  
  return {
    days: selectedDays,
    time: randomTime
  };
};

// Template dữ liệu lớp học cho mỗi khóa học
const classTemplates = [
  // Template cho lớp 1 (buổi sáng)
  {
    suffix: 'Sáng',
    description: 'Lớp học buổi sáng với không khí thoải mái, phù hợp cho những ai muốn bắt đầu ngày mới với việc học tiếng Hàn.',
    maxStudents: 25,
    schedulePreference: 'morning'
  },
  // Template cho lớp 2 (buổi chiều)
  {
    suffix: 'Chiều',
    description: 'Lớp học buổi chiều năng động, tạo cơ hội giao lưu và thảo luận nhiều giữa các học viên.',
    maxStudents: 30,
    schedulePreference: 'afternoon'
  },
  // Template cho lớp 3 (buổi tối)
  {
    suffix: 'Tối',
    description: 'Lớp học buổi tối dành cho những người đi làm, học sinh sinh viên muốn học thêm sau giờ học/làm việc chính.',
    maxStudents: 20,
    schedulePreference: 'evening'
  }
];

// Hàm tạo lịch theo preference
const generateScheduleByPreference = (preference) => {
  const allDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  let times = [];
  
  switch(preference) {
    case 'morning':
      times = ['07:00-09:00', '08:00-10:00', '09:00-11:00'];
      break;
    case 'afternoon':
      times = ['13:00-15:00', '14:00-16:00', '15:00-17:00'];
      break;
    case 'evening':
      times = ['18:00-20:00', '19:00-21:00', '20:00-22:00'];
      break;
    default:
      times = ['08:00-10:00', '14:00-16:00', '19:00-21:00'];
  }
  
  // Chọn 2-3 ngày trong tuần
  const numDays = Math.floor(Math.random() * 2) + 2;
  const selectedDays = [];
  
  for (let i = 0; i < numDays; i++) {
    let randomDay;
    do {
      randomDay = allDays[Math.floor(Math.random() * allDays.length)];
    } while (selectedDays.includes(randomDay));
    selectedDays.push(randomDay);
  }
  
  const randomTime = times[Math.floor(Math.random() * times.length)];
  
  return {
    days: selectedDays,
    time: randomTime
  };
};

// Hàm lấy tất cả khóa học
const getAllCourses = async () => {
  try {
    const courses = await Course.find({ status: 'active' }).populate('instructor');
    return courses;
  } catch (error) {
    console.error('Error getting courses:', error);
    return [];
  }
};

// Hàm kiểm tra lớp học đã tồn tại
const checkExistingClass = async (courseId, className) => {
  try {
    const existingClass = await Class.findOne({ 
      name: className,
      course: courseId
    });
    return existingClass;
  } catch (error) {
    console.error('Error checking existing class:', error);
    return null;
  }
};

// Hàm thêm lớp học cho khóa học
const addClassesForCourses = async () => {
  try {
    console.log('Starting to add classes for courses...');
    
    // Lấy tất cả khóa học
    const courses = await getAllCourses();
    
    if (courses.length === 0) {
      console.log('❌ Không tìm thấy khóa học nào trong database');
      return;
    }
    
    console.log(`📚 Tìm thấy ${courses.length} khóa học`);
    
    let totalAddedCount = 0;
    let totalSkippedCount = 0;
    let courseProcessed = 0;

    for (const course of courses) {
      console.log(`\n🏫 Xử lý lớp học cho khóa học: ${course.title}`);
      console.log(`   Giảng viên: ${course.instructor.fullName}`);
      
      let classAddedCount = 0;
      let classSkippedCount = 0;

      // Tạo 3 lớp cho mỗi khóa học
      for (let i = 0; i < 3; i++) {
        const template = classTemplates[i];
        const className = `${course.title} - Lớp ${template.suffix}`;
        
        // Kiểm tra lớp học đã tồn tại chưa
        const existingClass = await checkExistingClass(course._id, className);
        
        if (existingClass) {
          console.log(`   ⚠️  Lớp "${className}" đã tồn tại, bỏ qua...`);
          classSkippedCount++;
          continue;
        }

        // Tạo ngày bắt đầu và kết thúc
        const { startDate, endDate } = generateRandomDates();
        
        // Tạo lịch học theo preference
        const schedule = generateScheduleByPreference(template.schedulePreference);
        
        // Tạo lớp học mới
        const newClass = new Class({
          name: className,
          course: course._id,
          description: template.description,
          teacher: course.instructor._id,
          students: [], // Bắt đầu với danh sách học sinh rỗng
          pendingRequests: [],
          startDate: startDate,
          endDate: endDate,
          schedule: schedule,
          status: 'active',
          maxStudents: template.maxStudents,
          classImage: course.imageUrl || '/images/default-class.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Lưu vào database
        await newClass.save();
        console.log(`   ✅ Đã thêm lớp: "${className}"`);
        console.log(`      - Lịch học: ${schedule.days.join(', ')} | ${schedule.time}`);
        console.log(`      - Thời gian: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`);
        console.log(`      - Sĩ số tối đa: ${template.maxStudents} học sinh`);
        classAddedCount++;
      }

      console.log(`   📊 Kết quả cho "${course.title}": ${classAddedCount} thêm mới, ${classSkippedCount} bỏ qua`);
      
      totalAddedCount += classAddedCount;
      totalSkippedCount += classSkippedCount;
      courseProcessed++;
    }

    console.log('\n🎯 TỔNG KẾT:');
    console.log(`📚 Số khóa học đã xử lý: ${courseProcessed}/${courses.length}`);
    console.log(`✅ Tổng số lớp học đã thêm: ${totalAddedCount}`);
    console.log(`⚠️  Tổng số lớp học bỏ qua: ${totalSkippedCount}`);
    console.log(`📝 Tổng số lớp học xử lý: ${totalAddedCount + totalSkippedCount}`);
    console.log(`🧮 Trung bình: ${(totalAddedCount / courseProcessed).toFixed(1)} lớp/khóa học`);

  } catch (error) {
    console.error('❌ Lỗi khi thêm lớp học:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm lớp học cho khóa học
    await addClassesForCourses();
    
    console.log('\n🎉 Hoàn thành quá trình thêm lớp học cho khóa học!');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình thực thi:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log('🔐 Đã đóng kết nối MongoDB');
    process.exit(0);
  }
};

// Thực thi script
if (require.main === module) {
  main();
}

module.exports = {
  addClassesForCourses,
  classTemplates
};
