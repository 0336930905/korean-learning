const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Invoice = require('../src/models/Invoice');

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

// Danh sách tên học viên Việt Nam
const studentNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Hoa', 'Đỗ Văn Giang', 'Bùi Thị Hạnh', 'Ngô Văn Inh', 'Đinh Thị Kim',
  'Lý Văn Long', 'Trịnh Thị Mai', 'Phan Văn Nam', 'Châu Thị Oanh', 'Tô Văn Phúc',
  'Đặng Thị Quỳnh', 'Lưu Văn Rồng', 'Hồ Thị Sương', 'Võ Văn Tài', 'Dương Thị Uyên',
  'Tạ Văn Vinh', 'Lại Thị Xuân', 'Huỳnh Văn Yên', 'Cao Thị Zin', 'Nguyễn Đức Anh',
  'Trần Thị Bảo', 'Lê Văn Chính', 'Phạm Thị Diệu', 'Hoàng Văn Đức', 'Vũ Thị Gái',
  'Đỗ Văn Hùng', 'Bùi Thị Linh', 'Ngô Văn Minh', 'Đinh Thị Nga', 'Lý Văn Phong',
  'Trịnh Thị Quyên', 'Phan Văn Sơn', 'Châu Thị Tâm', 'Tô Văn Uy', 'Đặng Thị Vân',
  'Lưu Văn Xuân', 'Hồ Thị Yến', 'Võ Văn Khoa', 'Dương Thị Lan', 'Tạ Văn Mạnh',
  'Lại Thị Nhi', 'Huỳnh Văn Phát', 'Cao Thị Quế', 'Nguyễn Văn Sáng', 'Trần Thị Tuyết',
  'Lê Văn Thành', 'Phạm Thị Vui', 'Hoàng Văn Xinh', 'Vũ Thị Yen', 'Đỗ Văn Bảo',
  'Bùi Thị Cẩm', 'Ngô Văn Đạt', 'Đinh Thị Hương', 'Lý Văn Khánh', 'Trịnh Thị Loan',
  'Phan Văn Mỹ', 'Châu Thị Nhung', 'Tô Văn Ôn', 'Đặng Thị Phượng', 'Lưu Văn Quang',
  'Hồ Thị Thảo', 'Võ Văn Tùng', 'Dương Thị Vượng', 'Tạ Văn Xung', 'Lại Thị Yên'
];

// Danh sách địa chỉ Việt Nam
const addresses = [
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Hue', 'Nha Trang',
  'Buôn Ma Thuột', 'Quy Nhon', 'Vũng Tàu', 'Nam Định', 'Thái Nguyên', 'Thanh Hóa', 'Vinh',
  'Rạch Giá', 'Long Xuyên', 'Hạ Long', 'Tuy Hòa', 'Phan Rang', 'Đồng Hới', 'Tam Kỳ',
  'Cao Lãnh', 'Mỹ Tho', 'Bến Tre', 'Sóc Trăng', 'Châu Đốc', 'Vĩnh Long', 'Cà Mau'
];

// Danh sách sở thích
const interests = [
  ['K-pop', 'Drama Hàn'], ['Ẩm thực', 'Du lịch'], ['Công nghệ', 'Game'], 
  ['Văn hóa Hàn Quốc', 'Phim'], ['Âm nhạc', 'Thể thao'], ['Đọc sách', 'Học tập'],
  ['Thời trang', 'Beauty'], ['Anime', 'Manga'], ['Lịch sử', 'Văn học'],
  ['Nhiếp ảnh', 'Nghệ thuật']
];

// Danh sách mục tiêu học tập
const learningGoals = [
  'Du học Hàn Quốc', 'Làm việc tại Hàn Quốc', 'Hiểu văn hóa K-pop',
  'Giao tiếp với bạn Hàn', 'Phát triển sự nghiệp', 'Đam mê ngôn ngữ',
  'Chuẩn bị thi TOPIK', 'Xem phim không phụ đề', 'Kinh doanh với Hàn Quốc',
  'Yêu thích văn hóa Hàn'
];

// Hàm tạo email ngẫu nhiên
const generateEmail = (fullName, index) => {
  const nameParts = fullName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ');
  const lastName = nameParts[nameParts.length - 1];
  const firstName = nameParts.slice(0, -1).join('');
  return `${firstName}${lastName}${index}@student.com`;
};

// Hàm tạo số điện thoại ngẫu nhiên
const generatePhone = () => {
  const prefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '090', '091', '094', '096', '097', '098'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
};

// Hàm tạo ngày sinh ngẫu nhiên (18-35 tuổi)
const generateDateOfBirth = () => {
  const today = new Date();
  const minAge = 18;
  const maxAge = 35;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
};

// Hàm mã hóa mật khẩu
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Hàm tạo học viên
const generateStudents = async (count) => {
  const students = [];
  const hashedPassword = await hashPassword('123456');
  
  for (let i = 0; i < count; i++) {
    const fullName = studentNames[i % studentNames.length];
    const email = generateEmail(fullName, Math.floor(i / studentNames.length) + 1);
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      continue; // Bỏ qua nếu email đã tồn tại
    }
    
    const student = {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName,
      role: 'student',
      gender: Math.random() > 0.5 ? 'male' : 'female',
      phone: generatePhone(),
      address: addresses[Math.floor(Math.random() * addresses.length)],
      koreanLevel: ['', 'TOPIK 1', 'TOPIK 2'][Math.floor(Math.random() * 3)],
      learningGoal: learningGoals[Math.floor(Math.random() * learningGoals.length)],
      interests: interests[Math.floor(Math.random() * interests.length)],
      dateOfBirth: generateDateOfBirth(),
      level: ['beginner', 'intermediate'][Math.floor(Math.random() * 2)],
      subscription: {
        type: Math.random() > 0.7 ? 'basic' : 'free',
        expiryDate: Math.random() > 0.5 ? new Date('2025-12-31') : undefined
      },
      notifications: {
        email: Math.random() > 0.3,
        push: Math.random() > 0.4
      },
      socialMedia: {
        facebook: Math.random() > 0.6 ? `https://facebook.com/${fullName.replace(/\s+/g, '').toLowerCase()}` : '',
        instagram: Math.random() > 0.5 ? `https://instagram.com/${fullName.replace(/\s+/g, '').toLowerCase()}` : ''
      },
      joinedDate: new Date(),
      lastLogin: new Date(),
      lastActive: new Date(),
      progress: {
        completedLessons: [],
        completedCourses: [],
        totalPoints: Math.floor(Math.random() * 100)
      },
      submissions: [],
      enrolledCourses: [],
      isActive: true,
      averageScore: Math.floor(Math.random() * 41) + 60, // 60-100
      emailVerified: true
    };
    
    students.push(student);
  }
  
  return students;
};

// Hàm lấy tất cả lớp học
const getAllClasses = async () => {
  try {
    const db = mongoose.connection.db;
    const classes = await db.collection('classes').find({ status: 'active' }).toArray();
    return classes;
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

// Hàm lấy khóa học theo ID
const getCourseById = async (courseId) => {
  try {
    const course = await Course.findById(courseId);
    return course;
  } catch (error) {
    console.error('Error getting course:', error);
    return null;
  }
};

// Hàm tạo hóa đơn thanh toán
const createInvoice = async (studentId, courseId, amount) => {
  const paymentMethods = ['zalopay_app', 'zalopay_qr', 'zalopay_cc', 'zalopay_atm'];
  const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  const invoice = new Invoice({
    student: studentId,
    course: courseId,
    amount: amount,
    paymentMethod: randomMethod,
    status: 'paid', // Tất cả đều đã thanh toán
    transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
    paidAt: new Date(),
    createdAt: new Date()
  });
  
  await invoice.save();
  return invoice;
};

// Hàm thêm học viên vào lớp học
const addStudentsToClasses = async () => {
  try {
    console.log('Starting to add students to classes...');
    
    // Lấy tất cả lớp học
    const classes = await getAllClasses();
    
    if (classes.length === 0) {
      console.log('❌ Không tìm thấy lớp học nào trong database');
      return;
    }
    
    console.log(`📚 Tìm thấy ${classes.length} lớp học`);
    
    // Tính tổng số học viên cần tạo
    const studentsPerClass = 15; // Tạo 15 học viên cho mỗi lớp để đảm bảo có ít nhất 10
    const totalStudentsNeeded = classes.length * studentsPerClass;
    
    console.log(`👥 Chuẩn bị tạo ${totalStudentsNeeded} học viên...`);
    
    // Tạo học viên
    const students = await generateStudents(totalStudentsNeeded);
    console.log(`✅ Đã tạo ${students.length} học viên mới`);
    
    // Lưu học viên vào database
    const savedStudents = await User.insertMany(students);
    console.log(`💾 Đã lưu ${savedStudents.length} học viên vào database`);
    
    let totalEnrolled = 0;
    let totalInvoices = 0;
    let classIndex = 0;
    
    const db = mongoose.connection.db;
    
    for (const classData of classes) {
      console.log(`\n🏫 Xử lý lớp: ${classData.name}`);
      
      // Lấy thông tin khóa học
      const course = await getCourseById(classData.course);
      if (!course) {
        console.log(`   ❌ Không tìm thấy khóa học cho lớp ${classData.name}`);
        continue;
      }
      
      // Chọn ngẫu nhiên 10-15 học viên cho lớp này
      const studentsForThisClass = Math.floor(Math.random() * 6) + 10; // 10-15 học viên
      const startIndex = classIndex * studentsPerClass;
      const endIndex = Math.min(startIndex + studentsForThisClass, savedStudents.length);
      const selectedStudents = savedStudents.slice(startIndex, endIndex);
      
      console.log(`   👥 Thêm ${selectedStudents.length} học viên vào lớp`);
      
      const studentIds = [];
      let invoiceCount = 0;
      
      for (const student of selectedStudents) {
        try {
          // Tạo hóa đơn thanh toán cho học viên
          await createInvoice(student._id, course._id, course.price);
          invoiceCount++;
          
          // Thêm ID học viên vào danh sách
          studentIds.push(student._id);
          
          // Cập nhật enrolledCourses cho học viên
          await User.findByIdAndUpdate(student._id, {
            $addToSet: { enrolledCourses: course._id }
          });
          
        } catch (error) {
          console.log(`     ❌ Lỗi khi xử lý học viên ${student.fullName}:`, error.message);
        }
      }
      
      // Cập nhật lớp học với danh sách học viên
      await db.collection('classes').updateOne(
        { _id: classData._id },
        { 
          $set: { 
            students: studentIds,
            updatedAt: new Date()
          }
        }
      );
      
      // Cập nhật số lượng học viên đã đăng ký cho khóa học
      await Course.findByIdAndUpdate(course._id, {
        $inc: { enrolledCount: studentIds.length },
        $addToSet: { enrolledStudents: { $each: studentIds } }
      });
      
      console.log(`   ✅ Đã thêm ${studentIds.length} học viên`);
      console.log(`   💳 Đã tạo ${invoiceCount} hóa đơn thanh toán`);
      console.log(`   💰 Tổng thu: ${(invoiceCount * course.price).toLocaleString('vi-VN')} VND`);
      
      totalEnrolled += studentIds.length;
      totalInvoices += invoiceCount;
      classIndex++;
    }
    
    console.log('\n🎯 TỔNG KẾT:');
    console.log(`🏫 Số lớp học đã xử lý: ${classes.length}`);
    console.log(`👥 Tổng số học viên đã thêm: ${totalEnrolled}`);
    console.log(`💳 Tổng số hóa đơn đã tạo: ${totalInvoices}`);
    console.log(`📊 Trung bình: ${(totalEnrolled / classes.length).toFixed(1)} học viên/lớp`);
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm học viên vào lớp học:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm học viên vào lớp học
    await addStudentsToClasses();
    
    console.log('\n🎉 Hoàn thành quá trình thêm học viên vào lớp học!');
    
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
  addStudentsToClasses,
  generateStudents
};
