const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Assignment = require('../src/models/Assignment');
const Submission = require('../src/models/submission');
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

// Danh sách các loại file submission phổ biến
const fileTypes = [
  { type: 'application/pdf', extension: 'pdf' },
  { type: 'application/msword', extension: 'doc' },
  { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx' },
  { type: 'text/plain', extension: 'txt' },
  { type: 'image/jpeg', extension: 'jpg' },
  { type: 'image/png', extension: 'png' },
  { type: 'audio/mpeg', extension: 'mp3' },
  { type: 'video/mp4', extension: 'mp4' }
];

// Template feedback cho các điểm số khác nhau
const feedbackTemplates = {
  excellent: [
    "Bài làm xuất sắc! Học sinh đã nắm vững kiến thức và thể hiện rất tốt.",
    "Rất tốt! Nội dung chính xác, trình bày logic và rõ ràng.",
    "Hoàn thành xuất sắc! Vượt xa mong đợi của giảng viên.",
    "Bài làm rất ấn tượng, thể hiện khả năng tư duy sáng tạo."
  ],
  good: [
    "Bài làm tốt! Có một số điểm cần cải thiện nhỏ.",
    "Nội dung đầy đủ, trình bày tốt. Tiếp tục phát huy!",
    "Đạt yêu cầu tốt, cần chú ý thêm về ngữ pháp.",
    "Làm rất tốt! Cần luyện tập thêm để hoàn thiện hơn."
  ],
  average: [
    "Bài làm đạt yêu cầu cơ bản. Cần cố gắng hơn ở các bài tiếp theo.",
    "Nội dung ổn nhưng cần chú ý thêm về chính tả và ngữ pháp.",
    "Đạt mức trung bình. Nên tham khảo thêm tài liệu để cải thiện.",
    "Cần cố gắng hơn. Hãy đặt câu hỏi khi gặp khó khăn."
  ],
  poor: [
    "Bài làm chưa đạt yêu cầu. Cần xem lại kiến thức và làm lại.",
    "Cần học bài kỹ hơn và tham khảo thêm tài liệu.",
    "Chưa nắm vững kiến thức. Hãy đến gặp giảng viên để hỗ trợ.",
    "Cần cải thiện nhiều. Khuyến khích tham gia thêm các hoạt động luyện tập."
  ]
};

// Hàm tạo tên file ngẫu nhiên
const generateFileName = (studentName, assignmentTitle, fileType) => {
  const cleanStudentName = studentName.replace(/\s+/g, '_').replace(/[^\w\-_]/g, '');
  const cleanAssignmentTitle = assignmentTitle.substring(0, 20).replace(/\s+/g, '_').replace(/[^\w\-_]/g, '');
  const timestamp = Date.now();
  return `${cleanStudentName}_${cleanAssignmentTitle}_${timestamp}.${fileType.extension}`;
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
  if (rand < 0.15) return Math.floor(Math.random() * 2) + 9; // 15% điểm 9-10 (xuất sắc)
  else if (rand < 0.45) return Math.floor(Math.random() * 2) + 7; // 30% điểm 7-8 (tốt)
  else if (rand < 0.80) return Math.floor(Math.random() * 2) + 5; // 35% điểm 5-6 (trung bình)
  else return Math.floor(Math.random() * 2) + 3; // 20% điểm 3-4 (yếu)
};

// Hàm tạo thời gian nộp bài ngẫu nhiên
const generateSubmissionTime = (dueDate, startDate) => {
  const start = startDate.getTime();
  const due = dueDate.getTime();
  const timeRange = due - start;
  
  // 80% nộp đúng hạn, 20% nộp muộn (nhưng không quá 7 ngày)
  if (Math.random() < 0.8) {
    // Nộp đúng hạn (từ startDate đến dueDate)
    return new Date(start + Math.random() * timeRange);
  } else {
    // Nộp muộn (từ dueDate đến dueDate + 7 ngày)
    const lateTimeRange = 7 * 24 * 60 * 60 * 1000; // 7 ngày
    return new Date(due + Math.random() * lateTimeRange);
  }
};

// Hàm chính thêm submissions
const addSubmissionsForAssignments = async () => {
  try {
    console.log('🚀 BẮT ĐẦU THÊM SUBMISSIONS CHO CÁC BÀI TẬP');
    console.log('='.repeat(60));

    // Lấy tất cả bài tập
    const assignments = await Assignment.find({})
      .populate('class')
      .populate('createdBy', 'fullName');

    console.log(`📝 Tìm thấy ${assignments.length} bài tập`);

    let totalSubmissionsAdded = 0;
    let totalSubmissionsSkipped = 0;

    for (const assignment of assignments) {
      console.log(`\n📚 Xử lý bài tập: "${assignment.title}"`);
      console.log(`   🏫 Lớp: ${assignment.class.name}`);
      console.log(`   👨‍🏫 Giảng viên: ${assignment.createdBy.fullName}`);

      // Lấy danh sách học sinh trong lớp
      const classWithStudents = await Class.findById(assignment.class._id)
        .populate('students', 'fullName email');

      const students = classWithStudents.students;
      console.log(`   👥 Số học sinh trong lớp: ${students.length}`);

      // Tạo submission cho từng học sinh (80% học sinh nộp bài)
      const submissionCount = Math.floor(students.length * 0.8);
      const selectedStudents = students
        .sort(() => 0.5 - Math.random())
        .slice(0, submissionCount);

      console.log(`   📤 Sẽ tạo ${selectedStudents.length} submissions`);

      for (const student of selectedStudents) {
        try {
          // Kiểm tra xem học sinh đã nộp bài chưa
          const existingSubmission = await Submission.findOne({
            assignment: assignment._id,
            student: student._id
          });

          if (existingSubmission) {
            console.log(`     ⚠️  ${student.fullName} đã nộp bài, bỏ qua`);
            totalSubmissionsSkipped++;
            continue;
          }

          // Tạo dữ liệu submission
          const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
          const fileName = generateFileName(student.fullName, assignment.title, fileType);
          const submissionTime = generateSubmissionTime(
            assignment.dueDate, 
            assignment.class.startDate
          );
          const isLate = submissionTime > assignment.dueDate;
          const score = generateRealisticScore();

          const submissionData = {
            assignment: assignment._id,
            student: student._id,
            fileName: fileName,
            fileType: fileType.type,
            submittedAt: submissionTime,
            status: 'graded',
            isLate: isLate,
            attempts: 1,
            grade: {
              score: score,
              percentage: (score / assignment.maxScore) * 100,
              feedback: generateFeedback(score),
              gradedAt: new Date(submissionTime.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Chấm trong vòng 7 ngày
              gradedBy: assignment.createdBy._id
            }
          };

          // Tạo submission mới
          const newSubmission = new Submission(submissionData);
          await newSubmission.save();

          console.log(`     ✅ ${student.fullName}: ${score}/${assignment.maxScore} điểm ${isLate ? '(Nộp muộn)' : ''}`);
          totalSubmissionsAdded++;

        } catch (error) {
          console.error(`     ❌ Lỗi khi tạo submission cho ${student.fullName}:`, error.message);
        }
      }
    }

    console.log('\n📊 KẾT QUẢ TỔNG KẾT:');
    console.log('='.repeat(50));
    console.log(`✅ Tổng submissions đã thêm: ${totalSubmissionsAdded}`);
    console.log(`⚠️  Tổng submissions đã bỏ qua: ${totalSubmissionsSkipped}`);
    console.log(`📝 Tổng bài tập đã xử lý: ${assignments.length}`);

    // Thống kê chi tiết
    const finalStats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          averageScore: { $avg: '$grade.score' },
          lateSubmissions: {
            $sum: { $cond: ['$isLate', 1, 0] }
          }
        }
      }
    ]);

    if (finalStats.length > 0) {
      const stats = finalStats[0];
      console.log(`📈 Tổng submissions trong hệ thống: ${stats.totalSubmissions}`);
      console.log(`📊 Điểm trung bình: ${stats.averageScore.toFixed(2)}/10`);
      console.log(`⏰ Submissions nộp muộn: ${stats.lateSubmissions}`);
    }

  } catch (error) {
    console.error('❌ Lỗi trong quá trình thêm submissions:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm submissions
    await addSubmissionsForAssignments();
    
    console.log('\n🎉 HOÀN THÀNH QUÁ TRÌNH THÊM SUBMISSIONS!');
    
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
  addSubmissionsForAssignments
};
