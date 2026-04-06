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

// Danh sách tên học viên Việt Nam (50 tên)
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
  'Lại Thị Nhi', 'Huỳnh Văn Phát', 'Cao Thị Quế', 'Nguyễn Văn Sáng', 'Trần Thị Tuyết'
];

// Danh sách địa chỉ
const addresses = [
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Hue', 'Nha Trang',
  'Buôn Ma Thuột', 'Quy Nhon', 'Vũng Tàu', 'Nam Định', 'Thái Nguyên', 'Thanh Hóa', 'Vinh'
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
  const prefixes = ['032', '033', '034', '035', '036', '037', '038', '039'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
};

// Hàm mã hóa mật khẩu
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Hàm thêm học viên vào lớp học từng lớp một
const addStudentsToClassesOneByOne = async () => {
  try {
    console.log('Starting to add students to classes...');
    
    // Lấy tất cả lớp học
    const db = mongoose.connection.db;
    const classes = await db.collection('classes').find({ status: 'active' }).toArray();
    
    if (classes.length === 0) {
      console.log('❌ Không tìm thấy lớp học nào trong database');
      return;
    }
    
    console.log(`📚 Tìm thấy ${classes.length} lớp học`);
    
    let totalEnrolled = 0;
    let totalInvoices = 0;
    let studentCounter = 1;
    const hashedPassword = await hashPassword('123456');
    
    // Xử lý từng lớp một
    for (let classIndex = 0; classIndex < Math.min(classes.length, 10); classIndex++) {
      const classData = classes[classIndex];
      console.log(`\n🏫 Xử lý lớp ${classIndex + 1}/${Math.min(classes.length, 10)}: ${classData.name}`);
      
      // Lấy thông tin khóa học
      const course = await Course.findById(classData.course);
      if (!course) {
        console.log(`   ❌ Không tìm thấy khóa học cho lớp ${classData.name}`);
        continue;
      }
      
      // Tạo 12 học viên cho lớp này
      const studentsForThisClass = 12;
      const studentIds = [];
      let invoiceCount = 0;
      
      console.log(`   👥 Tạo ${studentsForThisClass} học viên cho lớp này...`);
      
      for (let i = 0; i < studentsForThisClass; i++) {
        const nameIndex = (studentCounter - 1) % studentNames.length;
        const fullName = studentNames[nameIndex];
        const email = generateEmail(fullName, studentCounter);
        
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          studentCounter++;
          continue;
        }
        
        try {
          // Tạo học viên mới
          const newStudent = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName: fullName,
            role: 'student',
            gender: Math.random() > 0.5 ? 'male' : 'female',
            phone: generatePhone(),
            address: addresses[Math.floor(Math.random() * addresses.length)],
            koreanLevel: ['', 'TOPIK 1', 'TOPIK 2'][Math.floor(Math.random() * 3)],
            learningGoal: 'Học tiếng Hàn để phát triển bản thân',
            interests: ['K-pop', 'Drama Hàn'],
            dateOfBirth: new Date(2000 - Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            level: 'beginner',
            subscription: { type: 'free' },
            notifications: { email: true, push: true },
            socialMedia: { facebook: '', instagram: '' },
            joinedDate: new Date(),
            lastLogin: new Date(),
            lastActive: new Date(),
            progress: {
              completedLessons: [],
              completedCourses: [],
              totalPoints: 0
            },
            submissions: [],
            enrolledCourses: [course._id],
            isActive: true,
            averageScore: 0,
            emailVerified: true
          });
          
          // Lưu học viên
          const savedStudent = await newStudent.save();
          
          // Tạo hóa đơn thanh toán
          const paymentMethods = ['zalopay_app', 'zalopay_qr', 'zalopay_cc', 'zalopay_atm'];
          const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
          
          const invoice = new Invoice({
            student: savedStudent._id,
            course: course._id,
            amount: course.price,
            paymentMethod: randomMethod,
            status: 'paid',
            transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
            paidAt: new Date(),
            createdAt: new Date()
          });
          
          await invoice.save();
          
          studentIds.push(savedStudent._id);
          invoiceCount++;
          studentCounter++;
          
          console.log(`     ✅ Tạo học viên: ${fullName} (${email})`);
          
        } catch (error) {
          console.log(`     ❌ Lỗi khi tạo học viên ${fullName}:`, error.message);
          studentCounter++;
        }
      }
      
      // Cập nhật lớp học với danh sách học viên
      if (studentIds.length > 0) {
        await db.collection('classes').updateOne(
          { _id: classData._id },
          { 
            $set: { 
              students: studentIds,
              updatedAt: new Date()
            }
          }
        );
        
        // Cập nhật khóa học
        await Course.findByIdAndUpdate(course._id, {
          $inc: { enrolledCount: studentIds.length },
          $addToSet: { enrolledStudents: { $each: studentIds } }
        });
        
        console.log(`   📊 Kết quả: ${studentIds.length} học viên, ${invoiceCount} hóa đơn`);
        console.log(`   💰 Doanh thu: ${(invoiceCount * course.price).toLocaleString('vi-VN')} VND`);
        
        totalEnrolled += studentIds.length;
        totalInvoices += invoiceCount;
      } else {
        console.log(`   ⚠️  Không có học viên nào được thêm vào lớp này`);
      }
    }
    
    console.log('\n🎯 TỔNG KẾT (10 lớp đầu tiên):');
    console.log(`🏫 Số lớp học đã xử lý: ${Math.min(classes.length, 10)}`);
    console.log(`👥 Tổng số học viên đã thêm: ${totalEnrolled}`);
    console.log(`💳 Tổng số hóa đơn đã tạo: ${totalInvoices}`);
    if (classes.length > 0) {
      console.log(`📊 Trung bình: ${(totalEnrolled / Math.min(classes.length, 10)).toFixed(1)} học viên/lớp`);
    }
    
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
    await addStudentsToClassesOneByOne();
    
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
  addStudentsToClassesOneByOne
};
