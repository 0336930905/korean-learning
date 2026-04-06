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

// Hàm kiểm tra thống kê bằng MongoDB native queries
const checkSubmissionAndTestStats = async () => {
  try {
    console.log('📊 THỐNG KÊ HỆ THỐNG HỌC TẬP - BÀI NỘP VÀ KIỂM TRA');
    console.log('='.repeat(70));

    const db = mongoose.connection.db;

    // 1. Thống kê tổng quan
    console.log('\n📋 THỐNG KÊ TỔNG QUAN:');
    console.log('-'.repeat(50));

    const totalClasses = await db.collection('classes').countDocuments();
    const totalAssignments = await db.collection('assignments').countDocuments();
    const totalSubmissions = await db.collection('submissions').countDocuments();
    const totalTests = await db.collection('classtests').countDocuments();
    const totalStudents = await db.collection('users').countDocuments({ role: 'student' });
    const totalTeachers = await db.collection('users').countDocuments({ role: 'teacher' });

    console.log(`🏫 Tổng số lớp học: ${totalClasses}`);
    console.log(`👥 Tổng số học sinh: ${totalStudents}`);
    console.log(`👨‍🏫 Tổng số giảng viên: ${totalTeachers}`);
    console.log(`📝 Tổng số bài tập: ${totalAssignments}`);
    console.log(`📄 Tổng số bài nộp: ${totalSubmissions}`);
    console.log(`🎯 Tổng số bài kiểm tra: ${totalTests}`);

    // 2. Thống kê bài nộp theo trạng thái
    console.log('\n📄 THỐNG KÊ BÀI NỘP THEO TRẠNG THÁI:');
    console.log('-'.repeat(50));

    const submissionsByStatus = await db.collection('submissions').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    submissionsByStatus.forEach(status => {
      const percentage = ((status.count / totalSubmissions) * 100).toFixed(1);
      console.log(`📊 ${status._id}: ${status.count} bài (${percentage}%)`);
    });

    // 3. Thống kê điểm số bài tập
    console.log('\n📈 THỐNG KÊ ĐIỂM SỐ BÀI TẬP:');
    console.log('-'.repeat(50));

    const gradedSubmissions = await db.collection('submissions').find({
      'grade.score': { $exists: true, $ne: null }
    }).toArray();

    if (gradedSubmissions.length > 0) {
      const scores = gradedSubmissions.map(s => s.grade.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      console.log(`📊 Tổng số bài đã chấm điểm: ${gradedSubmissions.length}`);
      console.log(`📊 Điểm trung bình: ${avgScore.toFixed(2)}/10`);
      console.log(`📊 Điểm cao nhất: ${maxScore.toFixed(1)}/10`);
      console.log(`📊 Điểm thấp nhất: ${minScore.toFixed(1)}/10`);

      // Phân bố điểm
      const scoreRanges = {
        'Xuất sắc (8.5-10)': scores.filter(s => s >= 8.5).length,
        'Tốt (7-8.4)': scores.filter(s => s >= 7 && s < 8.5).length,
        'Khá (5.5-6.9)': scores.filter(s => s >= 5.5 && s < 7).length,
        'Trung bình (4-5.4)': scores.filter(s => s >= 4 && s < 5.5).length,
        'Yếu (<4)': scores.filter(s => s < 4).length
      };

      console.log('\n📊 PHÂN BỐ ĐIỂM BÀI TẬP:');
      Object.entries(scoreRanges).forEach(([range, count]) => {
        const percentage = ((count / scores.length) * 100).toFixed(1);
        console.log(`   ${range}: ${count} bài (${percentage}%)`);
      });
    }

    // 4. Thống kê bài kiểm tra
    console.log('\n🎯 THỐNG KÊ BÀI KIỂM TRA:');
    console.log('-'.repeat(50));

    const allTests = await db.collection('classtests').find({}).toArray();
    let totalTestScores = 0;
    let testScoresList = [];

    allTests.forEach(test => {
      if (test.scores && test.scores.length > 0) {
        test.scores.forEach(score => {
          testScoresList.push(score.score);
          totalTestScores += score.score;
        });
      }
    });

    console.log(`📊 Tổng số bài kiểm tra: ${totalTests}`);
    console.log(`📊 Tổng số điểm kiểm tra: ${testScoresList.length}`);

    if (testScoresList.length > 0) {
      const avgTestScore = testScoresList.reduce((a, b) => a + b, 0) / testScoresList.length;
      const maxTestScore = Math.max(...testScoresList);
      const minTestScore = Math.min(...testScoresList);

      console.log(`📊 Điểm trung bình kiểm tra: ${avgTestScore.toFixed(2)}/10`);
      console.log(`📊 Điểm cao nhất: ${maxTestScore.toFixed(1)}/10`);
      console.log(`📊 Điểm thấp nhất: ${minTestScore.toFixed(1)}/10`);

      // Phân bố điểm kiểm tra
      const testRanges = {
        'Xuất sắc (8.5-10)': testScoresList.filter(s => s >= 8.5).length,
        'Tốt (7-8.4)': testScoresList.filter(s => s >= 7 && s < 8.5).length,
        'Khá (5.5-6.9)': testScoresList.filter(s => s >= 5.5 && s < 7).length,
        'Trung bình (4-5.4)': testScoresList.filter(s => s >= 4 && s < 5.5).length,
        'Yếu (<4)': testScoresList.filter(s => s < 4).length
      };

      console.log('\n📊 PHÂN BỐ ĐIỂM KIỂM TRA:');
      Object.entries(testRanges).forEach(([range, count]) => {
        const percentage = ((count / testScoresList.length) * 100).toFixed(1);
        console.log(`   ${range}: ${count} bài (${percentage}%)`);
      });
    }

    // 5. Thống kê theo lớp học
    console.log('\n🏫 THỐNG KÊ THEO LỚP HỌC (TOP 10):');
    console.log('-'.repeat(50));

    const classesList = await db.collection('classes').find({}).toArray();
    let classStats = [];

    for (const classItem of classesList) {
      const assignments = await db.collection('assignments').find({ class: classItem._id }).toArray();
      const assignmentIds = assignments.map(a => a._id);
      const submissions = await db.collection('submissions').find({ 
        assignment: { $in: assignmentIds }
      }).toArray();
      const tests = await db.collection('classtests').find({ class: classItem._id }).toArray();

      classStats.push({
        name: classItem.name,
        studentCount: classItem.students ? classItem.students.length : 0,
        assignmentCount: assignments.length,
        submissionCount: submissions.length,
        testCount: tests.length
      });
    }

    // Sắp xếp theo số bài nộp giảm dần
    classStats.sort((a, b) => b.submissionCount - a.submissionCount);

    classStats.slice(0, 10).forEach((classItem, index) => {
      console.log(`${index + 1}. ${classItem.name}:`);
      console.log(`   👥 Học sinh: ${classItem.studentCount}`);
      console.log(`   📝 Bài tập: ${classItem.assignmentCount}`);
      console.log(`   📄 Bài nộp: ${classItem.submissionCount}`);
      console.log(`   🎯 Kiểm tra: ${classItem.testCount}`);
    });

    // 6. Thống kê theo loại file bài nộp
    console.log('\n📎 THỐNG KÊ THEO LOẠI FILE BÀI NỘP:');
    console.log('-'.repeat(50));

    const fileTypes = await db.collection('submissions').aggregate([
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    fileTypes.forEach(type => {
      const percentage = ((type.count / totalSubmissions) * 100).toFixed(1);
      console.log(`📎 ${type._id}: ${type.count} file (${percentage}%)`);
    });

    // 7. Thống kê bài nộp trễ
    console.log('\n⏰ THỐNG KÊ BÀI NỘP TRỄ:');
    console.log('-'.repeat(50));

    const lateSubmissions = await db.collection('submissions').countDocuments({ isLate: true });
    const latePercentage = ((lateSubmissions / totalSubmissions) * 100).toFixed(1);

    console.log(`⏰ Tổng số bài nộp trễ: ${lateSubmissions} (${latePercentage}%)`);
    console.log(`✅ Tổng số bài nộp đúng hạn: ${totalSubmissions - lateSubmissions} (${(100 - latePercentage).toFixed(1)}%)`);

    console.log('\n✅ Hoàn thành kiểm tra thống kê chi tiết!');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra thống kê:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Kiểm tra thống kê
    await checkSubmissionAndTestStats();
    
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
  checkSubmissionAndTestStats
};
