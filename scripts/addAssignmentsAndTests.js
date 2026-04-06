const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
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

// Dữ liệu mẫu cho bài tập
const assignmentTemplates = [
  {
    title: 'Bài tập về từ vựng cơ bản',
    description: 'Hoàn thành bài tập từ vựng trong sách giáo khoa trang 10-15. Học thuộc 50 từ vựng cơ bản về gia đình và nghề nghiệp.',
    daysUntilDue: 7,
    maxScore: 10
  },
  {
    title: 'Luyện tập ngữ pháp câu cơ bản',
    description: 'Thực hiện các bài tập ngữ pháp về cấu trúc câu cơ bản, thì hiện tại và quá khứ. Hoàn thành 20 câu ví dụ.',
    daysUntilDue: 10,
    maxScore: 10
  },
  {
    title: 'Bài tập phát âm và nghe',
    description: 'Nghe và lặp lại 30 từ vựng, ghi âm giọng nói của mình đọc 10 câu mẫu.',
    daysUntilDue: 5,
    maxScore: 10
  },
  {
    title: 'Viết đoạn văn tự giới thiệu',
    description: 'Viết một đoạn văn ngắn 5-7 câu giới thiệu về bản thân bằng tiếng Hàn, sử dụng các từ vựng và ngữ pháp đã học.',
    daysUntilDue: 14,
    maxScore: 10
  },
  {
    title: 'Bài tập về văn hóa Hàn Quốc',
    description: 'Nghiên cứu và viết báo cáo ngắn về một khía cạnh văn hóa Hàn Quốc (lễ hội, ẩm thực, phong tục).',
    daysUntilDue: 21,
    maxScore: 10
  },
  {
    title: 'Luyện tập hội thoại cơ bản',
    description: 'Thực hành hội thoại với bạn cùng lớp về các chủ đề: chào hỏi, mua sắm, ăn uống. Ghi video 3-5 phút.',
    daysUntilDue: 12,
    maxScore: 10
  },
  {
    title: 'Ôn tập tổng hợp',
    description: 'Làm bài tập tổng hợp về tất cả kiến thức đã học: từ vựng, ngữ pháp, nghe, nói, đọc, viết.',
    daysUntilDue: 7,
    maxScore: 10
  }
];

// Dữ liệu mẫu cho kiểm tra
const testTemplates = [
  {
    testName: 'Kiểm tra từ vựng giữa kỳ',
    daysFromNow: 15,
    maxScore: 10
  },
  {
    testName: 'Kiểm tra ngữ pháp và giao tiếp',
    daysFromNow: 30,
    maxScore: 10
  },
  {
    testName: 'Kiểm tra tổng hợp cuối kỳ',
    daysFromNow: 45,
    maxScore: 10
  }
];

// Hàm tạo ngày hạn nộp
const createDueDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Hàm tạo điểm ngẫu nhiên
const generateRandomScore = (maxScore) => {
  // Tạo điểm theo phân phối: 70% điểm cao (7-10), 30% điểm thấp (5-6)
  if (Math.random() < 0.7) {
    return Math.floor(Math.random() * 4) + 7; // 7-10
  } else {
    return Math.floor(Math.random() * 2) + 5; // 5-6
  }
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

// Hàm tạo bài tập cho một lớp
const createAssignmentsForClass = async (classData) => {
  const assignments = [];
  
  for (let i = 0; i < assignmentTemplates.length; i++) {
    const template = assignmentTemplates[i];
    
    try {
      // Kiểm tra bài tập đã tồn tại chưa
      const existingAssignment = await Assignment.findOne({
        title: template.title,
        class: classData._id
      });
      
      if (existingAssignment) {
        console.log(`     ⚠️  Bài tập "${template.title}" đã tồn tại, bỏ qua...`);
        continue;
      }
      
      const assignment = new Assignment({
        title: template.title,
        description: template.description,
        dueDate: createDueDate(template.daysUntilDue),
        class: classData._id,
        createdBy: classData.teacher,
        maxScore: template.maxScore,
        status: 'active',
        submissionStats: {
          totalSubmissions: 0,
          gradedSubmissions: 0,
          averageScore: 0
        }
      });
      
      const savedAssignment = await assignment.save();
      assignments.push(savedAssignment);
      console.log(`     ✅ Tạo bài tập: "${template.title}"`);
      
    } catch (error) {
      console.log(`     ❌ Lỗi khi tạo bài tập "${template.title}":`, error.message);
    }
  }
  
  return assignments;
};

// Hàm tạo bài nộp cho bài tập
const createSubmissionsForAssignment = async (assignment, students) => {
  const submissions = [];
  
  // 90% học sinh nộp bài
  const submissionRate = 0.9;
  const studentsToSubmit = students.slice(0, Math.floor(students.length * submissionRate));
  
  for (const student of studentsToSubmit) {
    try {
      // Kiểm tra submission đã tồn tại chưa
      const existingSubmission = await Submission.findOne({
        assignment: assignment._id,
        student: student
      });
      
      if (existingSubmission) {
        continue;
      }
      
      const isLate = Math.random() < 0.1; // 10% nộp muộn
      const submittedAt = isLate ? 
        new Date(assignment.dueDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : // 1-3 ngày muộn
        new Date(assignment.dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // trước hạn
      
      const score = generateRandomScore(assignment.maxScore);
      const percentage = Math.round((score / assignment.maxScore) * 100);
      
      const submission = new Submission({
        assignment: assignment._id,
        student: student,
        fileName: `baitap_${assignment.title.replace(/\s+/g, '_').toLowerCase()}_${student.toString().slice(-6)}.pdf`,
        fileType: 'application/pdf',
        submittedAt: submittedAt,
        status: 'graded',
        grade: {
          score: score,
          percentage: percentage,
          feedback: score >= 8 ? 'Bài làm tốt, cần tiếp tục phát huy!' : 
                   score >= 6 ? 'Bài làm khá, cần cải thiện một số điểm.' : 
                   'Cần ôn tập kỹ hơn và làm lại.',
          gradedAt: new Date(),
          gradedBy: assignment.createdBy
        },
        attempts: 1,
        isLate: isLate
      });
      
      const savedSubmission = await submission.save();
      submissions.push(savedSubmission);
      
    } catch (error) {
      console.log(`       ❌ Lỗi khi tạo submission cho học sinh:`, error.message);
    }
  }
  
  // Cập nhật thống kê cho assignment
  if (submissions.length > 0) {
    const totalScore = submissions.reduce((sum, sub) => sum + sub.grade.score, 0);
    const averageScore = totalScore / submissions.length;
    
    await Assignment.findByIdAndUpdate(assignment._id, {
      'submissionStats.totalSubmissions': submissions.length,
      'submissionStats.gradedSubmissions': submissions.length,
      'submissionStats.averageScore': Math.round(averageScore * 100) / 100
    });
  }
  
  return submissions;
};

// Hàm tạo kiểm tra cho lớp
const createTestsForClass = async (classData, students) => {
  const tests = [];
  
  for (let i = 0; i < testTemplates.length; i++) {
    const template = testTemplates[i];
    
    try {
      // Kiểm tra test đã tồn tại chưa
      const existingTest = await ClassTest.findOne({
        class: classData._id,
        testName: template.testName
      });
      
      if (existingTest) {
        console.log(`     ⚠️  Kiểm tra "${template.testName}" đã tồn tại, bỏ qua...`);
        continue;
      }
      
      const testDate = createDueDate(template.daysFromNow);
      const scores = [];
      
      // 95% học sinh tham gia kiểm tra
      const participationRate = 0.95;
      const studentsToTest = students.slice(0, Math.floor(students.length * participationRate));
      
      for (const student of studentsToTest) {
        const score = generateRandomScore(template.maxScore);
        scores.push({
          student: student,
          score: score,
          notes: score >= 8 ? 'Xuất sắc' : 
                 score >= 6 ? 'Khá' : 'Cần cố gắng hơn',
          gradedBy: classData.teacher,
          gradedAt: new Date()
        });
      }
      
      const classTest = new ClassTest({
        class: classData._id,
        testName: template.testName,
        testDate: testDate,
        maxScore: template.maxScore,
        scores: scores,
        createdBy: classData.teacher,
        createdAt: new Date()
      });
      
      const savedTest = await classTest.save();
      tests.push(savedTest);
      console.log(`     ✅ Tạo kiểm tra: "${template.testName}" với ${scores.length} điểm`);
      
    } catch (error) {
      console.log(`     ❌ Lỗi khi tạo kiểm tra "${template.testName}":`, error.message);
    }
  }
  
  return tests;
};

// Hàm chính để thêm bài tập và kiểm tra
const addAssignmentsAndTests = async () => {
  try {
    console.log('Starting to add assignments, submissions and tests...');
    
    // Lấy tất cả lớp học
    const classes = await getAllClasses();
    
    if (classes.length === 0) {
      console.log('❌ Không tìm thấy lớp học nào trong database');
      return;
    }
    
    console.log(`📚 Tìm thấy ${classes.length} lớp học`);
    
    let totalAssignments = 0;
    let totalSubmissions = 0;
    let totalTests = 0;
    let processedClasses = 0;
    
    // Xử lý từng lớp (giới hạn 10 lớp đầu tiên để test)
    const classesToProcess = classes.slice(0, 10);
    
    for (const classData of classesToProcess) {
      console.log(`\n🏫 Xử lý lớp: ${classData.name}`);
      console.log(`   👥 Số học sinh: ${classData.students ? classData.students.length : 0}`);
      
      if (!classData.students || classData.students.length === 0) {
        console.log(`   ⚠️  Lớp không có học sinh, bỏ qua...`);
        continue;
      }
      
      // Tạo bài tập
      console.log(`   📝 Tạo bài tập...`);
      const assignments = await createAssignmentsForClass(classData);
      totalAssignments += assignments.length;
      
      // Tạo submissions cho từng assignment
      console.log(`   📤 Tạo bài nộp...`);
      for (const assignment of assignments) {
        const submissions = await createSubmissionsForAssignment(assignment, classData.students);
        totalSubmissions += submissions.length;
        console.log(`       ✅ ${submissions.length} bài nộp cho "${assignment.title}"`);
      }
      
      // Tạo kiểm tra
      console.log(`   📊 Tạo kiểm tra...`);
      const tests = await createTestsForClass(classData, classData.students);
      totalTests += tests.length;
      
      processedClasses++;
      console.log(`   📋 Kết quả lớp: ${assignments.length} bài tập, ${tests.length} kiểm tra`);
    }
    
    console.log('\n🎯 TỔNG KẾT:');
    console.log(`🏫 Số lớp đã xử lý: ${processedClasses}/${classesToProcess.length}`);
    console.log(`📝 Tổng số bài tập đã tạo: ${totalAssignments}`);
    console.log(`📤 Tổng số bài nộp đã tạo: ${totalSubmissions}`);
    console.log(`📊 Tổng số kiểm tra đã tạo: ${totalTests}`);
    console.log(`📊 Trung bình: ${(totalAssignments / processedClasses).toFixed(1)} bài tập/lớp`);
    console.log(`📊 Trung bình: ${(totalTests / processedClasses).toFixed(1)} kiểm tra/lớp`);
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm bài tập và kiểm tra:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm bài tập và kiểm tra
    await addAssignmentsAndTests();
    
    console.log('\n🎉 Hoàn thành quá trình thêm bài tập và kiểm tra!');
    
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
  addAssignmentsAndTests
};
