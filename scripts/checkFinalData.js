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

// Kiểm tra dữ liệu cuối cùng
const checkFinalData = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Đếm số lớp học
    const classCount = await db.collection('classes').countDocuments();
    console.log(`📚 Tổng số lớp học: ${classCount}`);
    
    // Đếm số khóa học
    const courseCount = await db.collection('courses').countDocuments();
    console.log(`🎓 Tổng số khóa học: ${courseCount}`);
    
    // Đếm số giảng viên
    const teacherCount = await db.collection('users').countDocuments({ role: 'teacher' });
    console.log(`👨‍🏫 Tổng số giảng viên: ${teacherCount}`);
    
    // Đếm số học viên
    const studentCount = await db.collection('users').countDocuments({ role: 'student' });
    console.log(`👥 Tổng số học viên: ${studentCount}`);
    
    // Đếm số hóa đơn
    const invoiceCount = await db.collection('invoices').countDocuments();
    console.log(`💳 Tổng số hóa đơn: ${invoiceCount}`);
    
    // Đếm số bài tập
    const assignmentCount = await db.collection('assignments').countDocuments();
    console.log(`📝 Tổng số bài tập: ${assignmentCount}`);
    
    // Đếm số bài nộp
    const submissionCount = await db.collection('submissions').countDocuments();
    console.log(`📤 Tổng số bài nộp: ${submissionCount}`);
    
    // Đếm số kiểm tra
    const testCount = await db.collection('classtests').countDocuments();
    console.log(`📊 Tổng số kiểm tra: ${testCount}`);
    
    console.log('\n📋 THỐNG KÊ CHI TIẾT:');
    
    // Thống kê bài tập theo lớp
    const assignmentsByClass = await db.collection('assignments').aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgAssignments: { $avg: '$count' },
          totalClasses: { $sum: 1 }
        }
      }
    ]).toArray();
    
    if (assignmentsByClass.length > 0) {
      console.log(`📊 Trung bình bài tập/lớp: ${assignmentsByClass[0].avgAssignments.toFixed(1)}`);
    }
    
    // Thống kê bài nộp theo trạng thái
    const submissionStats = await db.collection('submissions').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('\n📤 Thống kê bài nộp theo trạng thái:');
    for (const stat of submissionStats) {
      console.log(`   - ${stat._id}: ${stat.count} bài`);
    }
    
    // Lấy một vài ví dụ bài tập
    const sampleAssignments = await db.collection('assignments').find({}).limit(3).toArray();
    console.log('\n📝 Một vài bài tập mẫu:');
    for (const assignment of sampleAssignments) {
      console.log(`   - ${assignment.title} (Hạn nộp: ${assignment.dueDate.toLocaleDateString('vi-VN')})`);
    }
    
    // Lấy một vài ví dụ kiểm tra
    const sampleTests = await db.collection('classtests').find({}).limit(3).toArray();
    console.log('\n📊 Một vài kiểm tra mẫu:');
    for (const test of sampleTests) {
      console.log(`   - ${test.testName} (Ngày thi: ${test.testDate.toLocaleDateString('vi-VN')}) - ${test.scores.length} học sinh`);
    }
    
    // Thống kê điểm kiểm tra
    const scoreStats = await db.collection('classtests').aggregate([
      { $unwind: '$scores' },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$scores.score' },
          minScore: { $min: '$scores.score' },
          maxScore: { $max: '$scores.score' },
          totalScores: { $sum: 1 }
        }
      }
    ]).toArray();
    
    if (scoreStats.length > 0) {
      const stats = scoreStats[0];
      console.log('\n📈 Thống kê điểm kiểm tra:');
      console.log(`   - Điểm trung bình: ${stats.avgScore.toFixed(2)}`);
      console.log(`   - Điểm thấp nhất: ${stats.minScore}`);
      console.log(`   - Điểm cao nhất: ${stats.maxScore}`);
      console.log(`   - Tổng số điểm: ${stats.totalScores}`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    await connectDB();
    await checkFinalData();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Đã đóng kết nối MongoDB');
    process.exit(0);
  }
};

main();
