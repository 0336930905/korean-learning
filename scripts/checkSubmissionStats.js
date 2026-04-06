const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Class = require('../src/models/class');
const Assignment = require('../src/models/Assignment');
const Submission = require('../src/models/submission');
const ClassTest = require('../src/models/ClassTest');

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

// Hàm kiểm tra dữ liệu chi tiết
const checkDetailedStats = async () => {
  try {
    console.log('📊 THỐNG KÊ CHI TIẾT HỆ THỐNG HỌC TẬP:');
    console.log('='.repeat(60));

    // 1. Thống kê lớp học và bài tập
    const classes = await Class.find({}).populate('course').populate('teacher');
    console.log(`\n📚 TỔNG QUAN LỚP HỌC VÀ BÀI TẬP:`);
    console.log(`📋 Tổng số lớp học: ${classes.length}`);

    let totalAssignmentsAcrossClasses = 0;
    let totalSubmissionsAcrossClasses = 0;
    let totalTestsAcrossClasses = 0;

    for (const classItem of classes) {
      const assignments = await Assignment.find({ class: classItem._id });
      const submissions = await Submission.find({ 
        assignment: { $in: assignments.map(a => a._id) }
      });
      const tests = await ClassTest.find({ class: classItem._id });

      totalAssignmentsAcrossClasses += assignments.length;
      totalSubmissionsAcrossClasses += submissions.length;
      totalTestsAcrossClasses += tests.length;

      console.log(`\n🏫 Lớp: ${classItem.name}`);
      console.log(`   📖 Khóa học: ${classItem.course?.title || 'N/A'}`);
      console.log(`   👨‍🏫 Giảng viên: ${classItem.teacher?.fullName || 'N/A'}`);
      console.log(`   👥 Số học sinh: ${classItem.students?.length || 0}`);
      console.log(`   📝 Số bài tập: ${assignments.length}`);
      console.log(`   📄 Số bài nộp: ${submissions.length}`);
      console.log(`   🎯 Số bài kiểm tra: ${tests.length}`);
    }

    console.log(`\n📊 TỔNG KẾT:`);
    console.log(`📝 Tổng bài tập: ${totalAssignmentsAcrossClasses}`);
    console.log(`📄 Tổng bài nộp: ${totalSubmissionsAcrossClasses}`);
    console.log(`🎯 Tổng bài kiểm tra: ${totalTestsAcrossClasses}`);

    // 2. Thống kê chi tiết bài nộp
    console.log(`\n📄 CHI TIẾT BÀI NỘP:`);
    console.log('-'.repeat(40));

    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageScore: { 
            $avg: {
              $cond: [
                { $ne: ['$grade.score', null] },
                '$grade.score',
                null
              ]
            }
          }
        }
      }
    ]);

    submissionStats.forEach(stat => {
      console.log(`📊 Trạng thái "${stat._id}": ${stat.count} bài`);
      if (stat.averageScore) {
        console.log(`   💯 Điểm trung bình: ${stat.averageScore.toFixed(2)}/10`);
      }
    });

    // 3. Phân bố điểm số
    console.log(`\n📈 PHÂN BỐ ĐIỂM SỐ BÀI TẬP:`);
    console.log('-'.repeat(40));

    const gradedSubmissions = await Submission.find({
      'grade.score': { $exists: true, $ne: null }
    }).select('grade.score');

    if (gradedSubmissions.length > 0) {
      const scores = gradedSubmissions.map(s => s.grade.score);
      const scoreRanges = {
        'Xuất sắc (8.5-10)': scores.filter(s => s >= 8.5).length,
        'Tốt (7-8.4)': scores.filter(s => s >= 7 && s < 8.5).length,
        'Khá (5.5-6.9)': scores.filter(s => s >= 5.5 && s < 7).length,
        'Trung bình (4-5.4)': scores.filter(s => s >= 4 && s < 5.5).length,
        'Yếu (<4)': scores.filter(s => s < 4).length
      };

      Object.entries(scoreRanges).forEach(([range, count]) => {
        const percentage = ((count / scores.length) * 100).toFixed(1);
        console.log(`📊 ${range}: ${count} bài (${percentage}%)`);
      });

      console.log(`📊 Điểm cao nhất: ${Math.max(...scores).toFixed(1)}/10`);
      console.log(`📊 Điểm thấp nhất: ${Math.min(...scores).toFixed(1)}/10`);
      console.log(`📊 Điểm trung bình: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)}/10`);
    }

    // 4. Thống kê bài kiểm tra chi tiết
    console.log(`\n🎯 CHI TIẾT BÀI KIỂM TRA:`);
    console.log('-'.repeat(40));

    const allTests = await ClassTest.find({}).populate('class');
    let totalTestScores = 0;
    let totalTestStudents = 0;

    const testScores = [];
    for (const test of allTests) {
      const scoresInTest = test.scores.length;
      totalTestStudents += scoresInTest;
      
      for (const score of test.scores) {
        testScores.push(score.score);
        totalTestScores += score.score;
      }

      console.log(`🎯 ${test.testName} (${test.class?.name || 'N/A'}): ${scoresInTest} học sinh tham gia`);
    }

    if (testScores.length > 0) {
      console.log(`\n📊 PHÂN BỐ ĐIỂM KIỂM TRA:`);
      const testRanges = {
        'Xuất sắc (8.5-10)': testScores.filter(s => s >= 8.5).length,
        'Tốt (7-8.4)': testScores.filter(s => s >= 7 && s < 8.5).length,
        'Khá (5.5-6.9)': testScores.filter(s => s >= 5.5 && s < 7).length,
        'Trung bình (4-5.4)': testScores.filter(s => s >= 4 && s < 5.5).length,
        'Yếu (<4)': testScores.filter(s => s < 4).length
      };

      Object.entries(testRanges).forEach(([range, count]) => {
        const percentage = ((count / testScores.length) * 100).toFixed(1);
        console.log(`📊 ${range}: ${count} bài (${percentage}%)`);
      });

      console.log(`📊 Điểm cao nhất: ${Math.max(...testScores).toFixed(1)}/10`);
      console.log(`📊 Điểm thấp nhất: ${Math.min(...testScores).toFixed(1)}/10`);
      console.log(`📊 Điểm trung bình: ${(testScores.reduce((a, b) => a + b, 0) / testScores.length).toFixed(2)}/10`);
    }

    // 5. Top học sinh có điểm cao
    console.log(`\n🏆 TOP HỌC SINH CÓ ĐIỂM CAO:`);
    console.log('-'.repeat(40));

    const topStudents = await Submission.aggregate([
      {
        $match: {
          'grade.score': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$student',
          averageScore: { $avg: '$grade.score' },
          totalSubmissions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $sort: { averageScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    topStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.studentInfo.fullName}: ${student.averageScore.toFixed(2)}/10 (${student.totalSubmissions} bài)`);
    });

    // 6. Thống kê giảng viên
    console.log(`\n👨‍🏫 THỐNG KÊ GIẢNG VIÊN:`);
    console.log('-'.repeat(40));

    const teachers = await User.find({ role: 'teacher' });
    for (const teacher of teachers) {
      const teacherClasses = await Class.find({ teacher: teacher._id });
      const teacherAssignments = await Assignment.find({ createdBy: teacher._id });
      const teacherTests = await ClassTest.find({ createdBy: teacher._id });

      console.log(`👨‍🏫 ${teacher.fullName}:`);
      console.log(`   📚 Số lớp giảng dạy: ${teacherClasses.length}`);
      console.log(`   📝 Số bài tập đã tạo: ${teacherAssignments.length}`);
      console.log(`   🎯 Số bài kiểm tra đã tạo: ${teacherTests.length}`);
    }

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
    
    // Kiểm tra thống kê chi tiết
    await checkDetailedStats();
    
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
  checkDetailedStats
};
