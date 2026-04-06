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

// Hàm tạo điểm ngẫu nhiên
const getRandomScore = (min = 0, max = 10) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

// Hàm tạo feedback ngẫu nhiên
const getRandomFeedback = (score) => {
  const feedbacks = {
    excellent: [
      "Bài làm xuất sắc! Có hiểu biết sâu sắc về vấn đề.",
      "Chất lượng bài nộp rất tốt, thể hiện sự chuẩn bị kỹ lưỡng.",
      "Tuyệt vời! Đã nắm vững kiến thức và áp dụng hiệu quả."
    ],
    good: [
      "Bài làm tốt, còn một số điểm cần cải thiện.",
      "Chất lượng ổn, cần chú ý thêm một số chi tiết.",
      "Bài làm khá tốt, tiếp tục cố gắng!"
    ],
    average: [
      "Bài làm đạt yêu cầu cơ bản, cần cải thiện thêm.",
      "Còn một số lỗi nhỏ, hãy xem lại kiến thức.",
      "Đạt mức trung bình, cần nỗ lực hơn nữa."
    ],
    poor: [
      "Bài làm chưa đạt yêu cầu, cần học lại kiến thức cơ bản.",
      "Còn nhiều điểm cần cải thiện, hãy tham khảo thêm tài liệu.",
      "Cần nỗ lực hơn để nắm vững kiến thức."
    ]
  };

  let category;
  if (score >= 8.5) category = 'excellent';
  else if (score >= 7) category = 'good';
  else if (score >= 5) category = 'average';
  else category = 'poor';

  const categoryFeedbacks = feedbacks[category];
  return categoryFeedbacks[Math.floor(Math.random() * categoryFeedbacks.length)];
};

// Hàm tạo tên file ngẫu nhiên
const getRandomFileName = (studentName, assignmentTitle) => {
  const fileTypes = ['docx', 'pdf', 'txt', 'pptx'];
  const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  const cleanStudentName = studentName.replace(/\s+/g, '_');
  const cleanAssignmentTitle = assignmentTitle.replace(/\s+/g, '_').substring(0, 20);
  return `${cleanStudentName}_${cleanAssignmentTitle}.${randomType}`;
};

// Hàm thêm bài nộp cho các bài tập
const addSubmissionsToAssignments = async () => {
  try {
    console.log('🚀 Bắt đầu thêm bài nộp cho các bài tập...');

    // Lấy tất cả các bài tập
    const assignments = await Assignment.find({}).populate('class');
    
    if (assignments.length === 0) {
      console.log('❌ Không tìm thấy bài tập nào!');
      return;
    }

    console.log(`📋 Tìm thấy ${assignments.length} bài tập`);

    let totalSubmissions = 0;
    let totalGraded = 0;

    for (const assignment of assignments) {
      if (!assignment.class) {
        console.log(`⚠️  Bài tập ${assignment.title} không có lớp học, bỏ qua...`);
        continue;
      }

      // Lấy danh sách học sinh trong lớp
      const classWithStudents = await Class.findById(assignment.class._id).populate('students');
      const students = classWithStudents.students;

      if (students.length === 0) {
        console.log(`⚠️  Lớp ${assignment.class.name} không có học sinh, bỏ qua...`);
        continue;
      }

      console.log(`📝 Xử lý bài tập "${assignment.title}" trong lớp "${assignment.class.name}" (${students.length} học sinh)`);

      // Tạo bài nộp cho một số học sinh (không phải tất cả để tạo tính thực tế)
      const submissionRate = 0.7 + Math.random() * 0.3; // 70-100% học sinh nộp bài
      const studentsToSubmit = students.slice(0, Math.floor(students.length * submissionRate));

      for (const student of studentsToSubmit) {
        // Kiểm tra xem học sinh đã nộp bài chưa
        const existingSubmission = await Submission.findOne({
          assignment: assignment._id,
          student: student._id
        });

        if (existingSubmission) {
          console.log(`⚠️  Học sinh ${student.fullName} đã nộp bài cho "${assignment.title}", bỏ qua...`);
          continue;
        }

        // Tạo thời gian nộp bài (trước deadline)
        const submittedAt = new Date(assignment.dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // 1-7 ngày trước deadline

        // Tạo bài nộp mới
        const fileName = getRandomFileName(student.fullName, assignment.title);
        const fileTypes = ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.ms-powerpoint'];
        const randomFileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];

        const newSubmission = new Submission({
          assignment: assignment._id,
          student: student._id,
          fileName: fileName,
          fileType: randomFileType,
          submittedAt: submittedAt,
          status: 'pending',
          attempts: 1,
          isLate: submittedAt > assignment.dueDate
        });

        await newSubmission.save();
        totalSubmissions++;

        // Chấm điểm một số bài (không phải tất cả)
        const shouldGrade = Math.random() > 0.2; // 80% bài được chấm điểm
        if (shouldGrade) {
          const score = getRandomScore(2, 10); // Điểm từ 2-10
          const feedback = getRandomFeedback(score);

          // Cập nhật điểm
          newSubmission.grade = {
            score: score,
            percentage: (score / assignment.maxScore) * 100,
            feedback: feedback,
            gradedAt: new Date(submittedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000), // Chấm trong vòng 3 ngày
            gradedBy: assignment.createdBy
          };
          newSubmission.status = 'graded';

          await newSubmission.save();
          totalGraded++;
        }
      }

      console.log(`✅ Đã thêm ${studentsToSubmit.length} bài nộp cho "${assignment.title}"`);
    }

    console.log('\n📊 KẾT QUẢ THÊM BÀI NỘP:');
    console.log(`✅ Tổng số bài nộp đã thêm: ${totalSubmissions}`);
    console.log(`🎯 Số bài đã chấm điểm: ${totalGraded}`);
    console.log(`⏳ Số bài chưa chấm: ${totalSubmissions - totalGraded}`);

  } catch (error) {
    console.error('❌ Lỗi khi thêm bài nộp:', error);
  }
};

// Hàm chấm điểm bài kiểm tra
const gradeClassTests = async () => {
  try {
    console.log('\n🎯 Bắt đầu chấm điểm bài kiểm tra...');

    // Lấy tất cả bài kiểm tra
    const classTests = await ClassTest.find({}).populate('class');
    
    if (classTests.length === 0) {
      console.log('❌ Không tìm thấy bài kiểm tra nào!');
      return;
    }

    console.log(`📋 Tìm thấy ${classTests.length} bài kiểm tra`);

    let totalScores = 0;
    let totalTests = 0;

    for (const test of classTests) {
      if (!test.class) {
        console.log(`⚠️  Bài kiểm tra ${test.testName} không có lớp học, bỏ qua...`);
        continue;
      }

      // Lấy danh sách học sinh trong lớp
      const classWithStudents = await Class.findById(test.class._id).populate('students');
      const students = classWithStudents.students;

      if (students.length === 0) {
        console.log(`⚠️  Lớp ${test.class.name} không có học sinh, bỏ qua...`);
        continue;
      }

      console.log(`📝 Chấm điểm "${test.testName}" trong lớp "${test.class.name}" (${students.length} học sinh)`);

      // Tỷ lệ học sinh tham gia kiểm tra (85-95%)
      const participationRate = 0.85 + Math.random() * 0.1;
      const studentsToGrade = students.slice(0, Math.floor(students.length * participationRate));

      let newScores = [];

      for (const student of studentsToGrade) {
        // Kiểm tra xem học sinh đã có điểm chưa
        const existingScore = test.scores.find(score => 
          score.student.toString() === student._id.toString()
        );

        if (existingScore) {
          console.log(`⚠️  Học sinh ${student.fullName} đã có điểm cho "${test.testName}", bỏ qua...`);
          continue;
        }

        // Tạo điểm ngẫu nhiên
        const score = getRandomScore(1, test.maxScore);
        const notes = getRandomFeedback(score);

        const newScore = {
          student: student._id,
          score: score,
          notes: notes,
          gradedBy: test.createdBy,
          gradedAt: new Date(test.testDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000) // Chấm trong vòng 5 ngày sau kiểm tra
        };

        newScores.push(newScore);
        totalScores++;
      }

      // Thêm điểm vào bài kiểm tra
      if (newScores.length > 0) {
        test.scores.push(...newScores);
        await test.save();
        console.log(`✅ Đã chấm điểm cho ${newScores.length} học sinh trong "${test.testName}"`);
      }

      totalTests++;
    }

    console.log('\n📊 KẾT QUẢ CHẤM ĐIỂM BÀI KIỂM TRA:');
    console.log(`✅ Tổng số bài kiểm tra đã xử lý: ${totalTests}`);
    console.log(`🎯 Tổng số điểm đã chấm: ${totalScores}`);

  } catch (error) {
    console.error('❌ Lỗi khi chấm điểm bài kiểm tra:', error);
  }
};

// Hàm thống kê tổng quan
const displayOverallStats = async () => {
  try {
    console.log('\n📈 THỐNG KÊ TỔNG QUAN:');

    // Thống kê bài tập và bài nộp
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const gradedSubmissions = await Submission.countDocuments({ status: 'graded' });
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });

    console.log('\n📝 BÀI TẬP VÀ BÀI NỘP:');
    console.log(`📋 Tổng số bài tập: ${totalAssignments}`);
    console.log(`📄 Tổng số bài nộp: ${totalSubmissions}`);
    console.log(`✅ Bài đã chấm điểm: ${gradedSubmissions}`);
    console.log(`⏳ Bài chưa chấm: ${pendingSubmissions}`);

    // Thống kê điểm trung bình
    const gradedSubmissionsWithScores = await Submission.find({ 
      status: 'graded',
      'grade.score': { $exists: true }
    });

    if (gradedSubmissionsWithScores.length > 0) {
      const averageScore = gradedSubmissionsWithScores.reduce((sum, sub) => sum + sub.grade.score, 0) / gradedSubmissionsWithScores.length;
      console.log(`📊 Điểm trung bình bài tập: ${averageScore.toFixed(2)}/10`);
    }

    // Thống kê bài kiểm tra
    const totalTests = await ClassTest.countDocuments();
    const allTests = await ClassTest.find({});
    const totalTestScores = allTests.reduce((sum, test) => sum + test.scores.length, 0);

    console.log('\n🎯 BÀI KIỂM TRA:');
    console.log(`📋 Tổng số bài kiểm tra: ${totalTests}`);
    console.log(`🎯 Tổng số điểm kiểm tra: ${totalTestScores}`);

    // Tính điểm trung bình kiểm tra
    if (totalTestScores > 0) {
      let totalTestPoints = 0;
      let scoreCount = 0;
      
      for (const test of allTests) {
        for (const score of test.scores) {
          totalTestPoints += score.score;
          scoreCount++;
        }
      }
      
      if (scoreCount > 0) {
        const averageTestScore = totalTestPoints / scoreCount;
        console.log(`📊 Điểm trung bình kiểm tra: ${averageTestScore.toFixed(2)}/10`);
      }
    }

  } catch (error) {
    console.error('❌ Lỗi khi thống kê:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm bài nộp cho các bài tập
    await addSubmissionsToAssignments();
    
    // Chấm điểm bài kiểm tra
    await gradeClassTests();
    
    // Hiển thị thống kê tổng quan
    await displayOverallStats();
    
    console.log('\n🎉 Hoàn thành tất cả các tác vụ!');
    
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
  addSubmissionsToAssignments,
  gradeClassTests,
  displayOverallStats
};
