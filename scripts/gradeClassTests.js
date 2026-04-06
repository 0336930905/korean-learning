const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const ClassTest = require('../src/models/ClassTest');
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

// Template feedback cho các điểm số khác nhau
const feedbackTemplates = {
  excellent: [
    "Bài kiểm tra xuất sắc! Học sinh đã nắm vững kiến thức.",
    "Rất tốt! Thể hiện khả năng hiểu bài sâu sắc.",
    "Hoàn thành xuất sắc! Vượt xa mong đợi.",
    "Bài làm rất ấn tượng, tiếp tục phát huy!",
    "Điểm số tuyệt vời! Đã hiểu rõ bài học."
  ],
  good: [
    "Bài kiểm tra tốt! Có một số điểm cần cải thiện nhỏ.",
    "Nội dung đầy đủ, cần chú ý thêm về chi tiết.",
    "Đạt yêu cầu tốt, tiếp tục cố gắng!",
    "Làm rất tốt! Cần luyện tập thêm để hoàn thiện.",
    "Kết quả khả quan, hãy duy trì phong độ."
  ],
  average: [
    "Bài kiểm tra đạt yêu cầu cơ bản. Cần cố gắng hơn.",
    "Nội dung ổn nhưng cần học bài kỹ hơn.",
    "Đạt mức trung bình. Nên ôn tập thêm.",
    "Cần cố gắng hơn. Hãy đặt câu hỏi khi khó khăn.",
    "Kết quả chưa cao, cần tập trung học tập hơn."
  ],
  poor: [
    "Bài kiểm tra chưa đạt yêu cầu. Cần xem lại kiến thức.",
    "Cần học bài kỹ hơn và tham khảo thêm tài liệu.",
    "Chưa nắm vững kiến thức. Hãy gặp giảng viên để hỗ trợ.",
    "Cần cải thiện nhiều. Khuyến khích tham gia thêm luyện tập.",
    "Điểm số thấp, cần đầu tư thời gian học tập nhiều hơn."
  ]
};

// Hàm tạo feedback dựa trên điểm số
const generateFeedback = (score) => {
  let templates;
  if (score >= 9) templates = feedbackTemplates.excellent;
  else if (score >= 7) templates = feedbackTemplates.good;
  else if (score >= 5) templates = feedbackTemplates.average;
  else templates = feedbackTemplates.poor;
  
  return templates[Math.floor(Math.random() * templates.length)];
};

// Hàm tạo điểm số ngẫu nhiên theo phân bố thực tế
const generateRealisticScore = () => {
  const rand = Math.random();
  if (rand < 0.20) return Math.floor(Math.random() * 2) + 9; // 20% điểm 9-10 (xuất sắc)
  else if (rand < 0.50) return Math.floor(Math.random() * 2) + 7; // 30% điểm 7-8 (tốt)  
  else if (rand < 0.80) return Math.floor(Math.random() * 2) + 5; // 30% điểm 5-6 (trung bình)
  else return Math.floor(Math.random() * 2) + 3; // 20% điểm 3-4 (yếu)
};

// Hàm chấm điểm cho các bài kiểm tra
const gradeClassTests = async () => {
  try {
    console.log('🚀 BẮT ĐẦU CHẤM ĐIỂM CÁC BÀI KIỂM TRA');
    console.log('='.repeat(60));

    // Lấy tất cả bài kiểm tra
    const classTests = await ClassTest.find({})
      .populate('class')
      .populate('createdBy', 'fullName');

    console.log(`📝 Tìm thấy ${classTests.length} bài kiểm tra`);

    let totalScoresAdded = 0;
    let totalScoresSkipped = 0;
    let totalTestsProcessed = 0;

    for (const classTest of classTests) {
      console.log(`\n📚 Xử lý bài kiểm tra: "${classTest.testName}"`);
      console.log(`   🏫 Lớp: ${classTest.class.name}`);
      console.log(`   👨‍🏫 Giảng viên: ${classTest.createdBy.fullName}`);
      console.log(`   📅 Ngày kiểm tra: ${classTest.testDate.toLocaleDateString('vi-VN')}`);

      // Lấy danh sách học sinh trong lớp
      const classWithStudents = await Class.findById(classTest.class._id)
        .populate('students', 'fullName email');

      const students = classWithStudents.students;
      console.log(`   👥 Số học sinh trong lớp: ${students.length}`);

      // Kiểm tra xem đã có điểm chưa
      if (classTest.scores && classTest.scores.length > 0) {
        console.log(`   ⚠️  Đã có ${classTest.scores.length} điểm, bỏ qua bài kiểm tra này`);
        totalScoresSkipped += classTest.scores.length;
        continue;
      }

      // Chấm điểm cho từng học sinh (85% học sinh có điểm - mô phỏng vắng mặt)
      const participatingStudents = students
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(students.length * 0.85));

      console.log(`   📝 Sẽ chấm điểm cho ${participatingStudents.length} học sinh`);

      const scores = [];
      for (const student of participatingStudents) {
        const score = generateRealisticScore();
        const feedback = generateFeedback(score);

        scores.push({
          student: student._id,
          score: score,
          notes: feedback,
          gradedBy: classTest.createdBy._id,
          gradedAt: new Date(classTest.testDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Chấm trong vòng 7 ngày sau kiểm tra
        });

        console.log(`     ✅ ${student.fullName}: ${score}/${classTest.maxScore} điểm`);
        totalScoresAdded++;
      }

      // Cập nhật điểm vào bài kiểm tra
      await ClassTest.findByIdAndUpdate(classTest._id, {
        $set: { scores: scores }
      });

      totalTestsProcessed++;
    }

    console.log('\n📊 KẾT QUẢ TỔNG KẾT:');
    console.log('='.repeat(50));
    console.log(`✅ Tổng điểm đã chấm: ${totalScoresAdded}`);
    console.log(`⚠️  Tổng điểm đã bỏ qua: ${totalScoresSkipped}`);
    console.log(`📝 Tổng bài kiểm tra đã xử lý: ${totalTestsProcessed}`);
    console.log(`📚 Tổng bài kiểm tra trong hệ thống: ${classTests.length}`);

    // Thống kê chi tiết
    const finalStats = await ClassTest.aggregate([
      { $unwind: '$scores' },
      {
        $group: {
          _id: null,
          totalScores: { $sum: 1 },
          averageScore: { $avg: '$scores.score' },
          maxScore: { $max: '$scores.score' },
          minScore: { $min: '$scores.score' }
        }
      }
    ]);

    if (finalStats.length > 0) {
      const stats = finalStats[0];
      console.log(`📈 Tổng điểm kiểm tra trong hệ thống: ${stats.totalScores}`);
      console.log(`📊 Điểm trung bình: ${stats.averageScore.toFixed(2)}/10`);
      console.log(`🏆 Điểm cao nhất: ${stats.maxScore}/10`);
      console.log(`📉 Điểm thấp nhất: ${stats.minScore}/10`);
    }

    // Thống kê theo từng loại bài kiểm tra
    console.log('\n📊 THỐNG KÊ THEO LOẠI BÀI KIỂM TRA:');
    console.log('-'.repeat(40));
    
    const testTypeStats = await ClassTest.aggregate([
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$testName',
          count: { $sum: 1 },
          averageScore: { $avg: '$scores.score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    testTypeStats.forEach(stat => {
      console.log(`📝 ${stat._id}: ${stat.count} điểm, TB: ${stat.averageScore.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Lỗi trong quá trình chấm điểm:', error);
  }
};

// Hàm cập nhật averageScore cho học sinh
const updateStudentAverageScores = async () => {
  try {
    console.log('\n🔄 ĐANG CẬP NHẬT ĐIỂM TRUNG BÌNH CHO HỌC SINH...');
    
    const students = await User.find({ role: 'student' });
    let updatedCount = 0;

    for (const student of students) {
      // Tính điểm trung bình từ submissions
      const Submission = require('../src/models/submission');
      const submissions = await Submission.find({ 
        student: student._id,
        'grade.score': { $exists: true }
      });

      // Tính điểm trung bình từ tests
      const testScores = await ClassTest.aggregate([
        { $unwind: '$scores' },
        { $match: { 'scores.student': student._id } },
        { $group: { _id: null, scores: { $push: '$scores.score' } } }
      ]);

      let totalScore = 0;
      let totalCount = 0;

      // Cộng điểm từ submissions
      if (submissions.length > 0) {
        const submissionTotal = submissions.reduce((sum, sub) => sum + sub.grade.score, 0);
        totalScore += submissionTotal;
        totalCount += submissions.length;
      }

      // Cộng điểm từ tests
      if (testScores.length > 0 && testScores[0].scores) {
        const testTotal = testScores[0].scores.reduce((sum, score) => sum + score, 0);
        totalScore += testTotal;
        totalCount += testScores[0].scores.length;
      }

      // Cập nhật điểm trung bình
      if (totalCount > 0) {
        const averageScore = totalScore / totalCount;
        await User.findByIdAndUpdate(student._id, {
          averageScore: Math.round(averageScore * 100) / 100
        });
        updatedCount++;
      }
    }

    console.log(`✅ Đã cập nhật điểm trung bình cho ${updatedCount} học sinh`);

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật điểm trung bình:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Chấm điểm bài kiểm tra
    await gradeClassTests();
    
    // Cập nhật điểm trung bình cho học sinh
    await updateStudentAverageScores();
    
    console.log('\n🎉 HOÀN THÀNH QUÁ TRÌNH CHẤM ĐIỂM!');
    
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
  gradeClassTests,
  updateStudentAverageScores
};
