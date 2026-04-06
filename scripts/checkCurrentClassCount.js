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

// Hàm kiểm tra số lớp học hiện tại
const checkCurrentClasses = async () => {
  try {
    console.log('🔍 KIỂM TRA SỐ LỚP HỌC HIỆN TẠI');
    console.log('='.repeat(60));

    const db = mongoose.connection.db;

    // Danh sách email giảng viên
    const teacherEmails = [
      'teacher1@example.com',
      'teacher2@example.com', 
      'teacher3@example.com',
      'teacher4@example.com',
      'teacher5@example.com'
    ];

    // Tìm các giảng viên
    const teachers = await db.collection('users').find({ 
      email: { $in: teacherEmails },
      role: 'teacher'
    }).toArray();

    console.log(`👨‍🏫 Tìm thấy ${teachers.length} giảng viên được chỉ định`);

    let totalClasses = 0;
    let totalAssignments = 0;
    let totalTests = 0;

    for (const teacher of teachers) {
      console.log(`\n👨‍🏫 ${teacher.fullName} (${teacher.email}):`);
      
      // Đếm lớp học
      const classes = await db.collection('classes').find({ teacher: teacher._id }).toArray();
      console.log(`   🏫 Số lớp: ${classes.length}`);
      totalClasses += classes.length;

      // Đếm bài tập hiện có
      const assignments = await db.collection('assignments').countDocuments({ createdBy: teacher._id });
      console.log(`   📝 Bài tập hiện có: ${assignments}`);
      totalAssignments += assignments;

      // Đếm bài kiểm tra hiện có
      const tests = await db.collection('classtests').countDocuments({ createdBy: teacher._id });
      console.log(`   🎯 Kiểm tra hiện có: ${tests}`);
      totalTests += tests;
    }

    console.log('\n📊 TỔNG KẾT:');
    console.log(`🏫 Tổng số lớp học của 5 giảng viên: ${totalClasses}`);
    console.log(`📝 Tổng số bài tập hiện có: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra hiện có: ${totalTests}`);

    // Kiểm tra xem có 57 lớp không
    if (totalClasses === 57) {
      console.log('✅ Đúng 57 lớp học như yêu cầu!');
    } else {
      console.log(`⚠️  Không đúng 57 lớp như yêu cầu (hiện có ${totalClasses} lớp)`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Kiểm tra số lớp học hiện tại
    await checkCurrentClasses();
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình thực thi:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
    console.log('🔒 Đã đóng kết nối MongoDB');
  }
};

// Thực thi script
if (require.main === module) {
  main();
}

module.exports = {
  checkCurrentClasses
};
