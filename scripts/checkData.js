const mongoose = require('mongoose');
require('dotenv').config();

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

// Kiểm tra dữ liệu
const checkData = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Đếm số lớp học
    const classCount = await db.collection('classes').countDocuments();
    console.log(`📚 Tổng số lớp học: ${classCount}`);
    
    // Đếm số khóa học
    const courseCount = await db.collection('courses').countDocuments();
    console.log(`🎓 Tổng số khóa học: ${courseCount}`);
    
    // Đếm số học viên (role = student)
    const studentCount = await db.collection('users').countDocuments({ role: 'student' });
    console.log(`👥 Tổng số học viên: ${studentCount}`);
    
    // Đếm số hóa đơn
    const invoiceCount = await db.collection('invoices').countDocuments();
    console.log(`💳 Tổng số hóa đơn: ${invoiceCount}`);
    
    // Lấy một vài lớp học mẫu
    const sampleClasses = await db.collection('classes').find({}).limit(3).toArray();
    console.log('\n📋 Một vài lớp học mẫu:');
    for (const cls of sampleClasses) {
      console.log(`   - ${cls.name}: ${cls.students ? cls.students.length : 0} học viên`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    await connectDB();
    await checkData();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Đã đóng kết nối MongoDB');
    process.exit(0);
  }
};

main();
