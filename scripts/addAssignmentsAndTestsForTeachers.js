const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Class = require('../src/models/class');
const Assignment = require('../src/models/Assignment');
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

// Danh sách email giảng viên được chỉ định
const teacherEmails = [
  'teacher1@example.com',
  'teacher2@example.com', 
  'teacher3@example.com',
  'teacher4@example.com',
  'teacher5@example.com'
];

// Template bài tập theo từng tuần
const assignmentTemplates = [
  {
    title: "Bài tập tuần 1: Giới thiệu bản thân",
    description: "Viết một đoạn văn ngắn giới thiệu về bản thân bằng tiếng Hàn, bao gồm tên, tuổi, quê quán và sở thích.",
    weekOffset: 1
  },
  {
    title: "Bài tập tuần 2: Từ vựng về gia đình",
    description: "Học thuộc 20 từ vựng về các thành viên trong gia đình và tạo câu với mỗi từ.",
    weekOffset: 2
  },
  {
    title: "Bài tập tuần 3: Ngữ pháp cơ bản",
    description: "Luyện tập các cấu trúc ngữ pháp cơ bản: 이/가, 은/는, 을/를. Làm 10 câu ví dụ cho mỗi trợ từ.",
    weekOffset: 3
  },
  {
    title: "Bài tập tuần 4: Hội thoại hàng ngày",
    description: "Thực hành hội thoại về chủ đề mua sắm tại cửa hàng. Ghi âm đoạn hội thoại 3-5 phút.",
    weekOffset: 4
  },
  {
    title: "Bài tập tuần 5: Viết thư cảm ơn",
    description: "Viết một lá thư cảm ơn bằng tiếng Hàn cho bạn bè hoặc gia đình, áp dụng các cấu trúc lịch sự.",
    weekOffset: 5
  },
  {
    title: "Bài tập tuần 6: Văn hóa Hàn Quốc",
    description: "Nghiên cứu và viết báo cáo về một khía cạnh văn hóa Hàn Quốc mà bạn quan tâm (1000 từ).",
    weekOffset: 6
  },
  {
    title: "Bài tập cuối kỳ: Dự án tổng hợp",
    description: "Tạo một video thuyết trình 10 phút về chủ đề bạn chọn, sử dụng tất cả kiến thức đã học.",
    weekOffset: 7
  }
];

// Template bài kiểm tra
const testTemplates = [
  {
    title: "Kiểm tra giữa kỳ - Phần 1",
    description: "Kiểm tra từ vựng và ngữ pháp cơ bản",
    weekOffset: 4
  },
  {
    title: "Kiểm tra giữa kỳ - Phần 2", 
    description: "Kiểm tra kỹ năng nghe và nói",
    weekOffset: 8
  },
  {
    title: "Kiểm tra cuối kỳ",
    description: "Kiểm tra tổng hợp tất cả kỹ năng đã học",
    weekOffset: 12
  }
];

// Hàm tính ngày dựa trên tuần
const calculateDate = (startDate, weekOffset, isTest = false) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + (weekOffset * 7));
  
  // Nếu là bài tập, deadline sau 7 ngày kể từ ngày giao
  // Nếu là kiểm tra, ngày kiểm tra chính là ngày đó
  if (!isTest) {
    date.setDate(date.getDate() + 7); // Deadline bài tập
  }
  
  return date;
};

// Hàm thêm bài tập cho một lớp
const addAssignmentsToClass = async (classData, teacher) => {
  try {
    const addedAssignments = [];
    
    for (const template of assignmentTemplates) {
      // Kiểm tra bài tập đã tồn tại chưa
      const existingAssignment = await Assignment.findOne({
        title: template.title,
        class: classData._id,
        createdBy: teacher._id
      });

      if (existingAssignment) {
        console.log(`⚠️  Bài tập "${template.title}" đã tồn tại trong lớp "${classData.name}", bỏ qua...`);
        continue;
      }

      // Tính ngày giao và deadline
      const dueDate = calculateDate(classData.startDate, template.weekOffset);
      
      // Tạo bài tập mới
      const newAssignment = new Assignment({
        title: template.title,
        description: template.description,
        dueDate: dueDate,
        class: classData._id,
        createdBy: teacher._id,
        maxScore: 10,
        status: dueDate > new Date() ? 'active' : 'expired',
        submissionStats: {
          totalSubmissions: 0,
          gradedSubmissions: 0,
          averageScore: 0
        }
      });

      await newAssignment.save();
      addedAssignments.push(newAssignment);
      
      console.log(`✅ Đã thêm bài tập: "${template.title}" cho lớp "${classData.name}"`);
    }

    return addedAssignments;
  } catch (error) {
    console.error(`❌ Lỗi khi thêm bài tập cho lớp ${classData.name}:`, error);
    return [];
  }
};

// Hàm thêm bài kiểm tra cho một lớp
const addTestsToClass = async (classData, teacher) => {
  try {
    const addedTests = [];
    
    for (const template of testTemplates) {
      // Kiểm tra bài kiểm tra đã tồn tại chưa
      const existingTest = await ClassTest.findOne({
        testName: template.title,
        class: classData._id,
        createdBy: teacher._id
      });

      if (existingTest) {
        console.log(`⚠️  Bài kiểm tra "${template.title}" đã tồn tại trong lớp "${classData.name}", bỏ qua...`);
        continue;
      }

      // Tính ngày kiểm tra
      const testDate = calculateDate(classData.startDate, template.weekOffset, true);
      
      // Tạo bài kiểm tra mới
      const newTest = new ClassTest({
        testName: template.title,
        testDate: testDate,
        class: classData._id,
        createdBy: teacher._id,
        maxScore: 10,
        scores: [] // Sẽ được thêm điểm sau khi học sinh làm bài
      });

      await newTest.save();
      addedTests.push(newTest);
      
      console.log(`✅ Đã thêm bài kiểm tra: "${template.title}" cho lớp "${classData.name}"`);
    }

    return addedTests;
  } catch (error) {
    console.error(`❌ Lỗi khi thêm bài kiểm tra cho lớp ${classData.name}:`, error);
    return [];
  }
};

// Hàm chính để thêm bài tập và kiểm tra
const addAssignmentsAndTests = async () => {
  try {
    console.log('🚀 Bắt đầu thêm bài tập và bài kiểm tra cho các lớp học...');
    console.log(`👨‍🏫 Giảng viên được chỉ định: ${teacherEmails.join(', ')}`);

    // Tìm các giảng viên được chỉ định
    const teachers = await User.find({ 
      email: { $in: teacherEmails },
      role: 'teacher'
    });

    if (teachers.length === 0) {
      console.log('❌ Không tìm thấy giảng viên nào!');
      return;
    }

    console.log(`👨‍🏫 Tìm thấy ${teachers.length} giảng viên:`);
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.fullName} (${teacher.email})`);
    });

    let totalAssignments = 0;
    let totalTests = 0;
    let totalClasses = 0;

    // Xử lý từng giảng viên
    for (const teacher of teachers) {
      console.log(`\n📚 Xử lý các lớp của giảng viên: ${teacher.fullName}`);
      
      // Tìm các lớp do giảng viên này giảng dạy
      const classes = await Class.find({ teacher: teacher._id }).populate('course');
      
      if (classes.length === 0) {
        console.log(`⚠️  Giảng viên ${teacher.fullName} không có lớp học nào, bỏ qua...`);
        continue;
      }

      console.log(`🏫 Tìm thấy ${classes.length} lớp học`);

      // Thêm bài tập và kiểm tra cho từng lớp
      for (const classData of classes) {
        console.log(`\n🏫 Xử lý lớp: ${classData.name}`);
        console.log(`   📖 Khóa học: ${classData.course?.title || 'N/A'}`);
        console.log(`   👥 Số học sinh: ${classData.students?.length || 0}`);

        // Thêm 7 bài tập
        console.log('   📝 Thêm bài tập...');
        const assignments = await addAssignmentsToClass(classData, teacher);
        totalAssignments += assignments.length;

        // Thêm 3 bài kiểm tra  
        console.log('   🎯 Thêm bài kiểm tra...');
        const tests = await addTestsToClass(classData, teacher);
        totalTests += tests.length;

        totalClasses++;
        console.log(`   ✅ Hoàn thành lớp "${classData.name}": ${assignments.length} bài tập, ${tests.length} bài kiểm tra`);
      }
    }

    console.log('\n📊 KẾT QUẢ TỔNG KẾT:');
    console.log(`🏫 Tổng số lớp đã xử lý: ${totalClasses}`);
    console.log(`📝 Tổng số bài tập đã thêm: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra đã thêm: ${totalTests}`);
    console.log(`👨‍🏫 Số giảng viên tham gia: ${teachers.length}`);

  } catch (error) {
    console.error('❌ Lỗi khi thêm bài tập và kiểm tra:', error);
  }
};

// Hàm kiểm tra thống kê sau khi thêm
const checkStats = async () => {
  try {
    console.log('\n📈 THỐNG KÊ SAU KHI THÊM:');
    console.log('-'.repeat(50));

    // Thống kê bài tập
    const totalAssignments = await Assignment.countDocuments();
    console.log(`📝 Tổng số bài tập trong hệ thống: ${totalAssignments}`);

    // Thống kê bài kiểm tra
    const totalTests = await ClassTest.countDocuments();
    console.log(`🎯 Tổng số bài kiểm tra trong hệ thống: ${totalTests}`);

    // Thống kê theo giảng viên
    for (const email of teacherEmails) {
      const teacher = await User.findOne({ email, role: 'teacher' });
      if (teacher) {
        const assignmentCount = await Assignment.countDocuments({ createdBy: teacher._id });
        const testCount = await ClassTest.countDocuments({ createdBy: teacher._id });
        console.log(`👨‍🏫 ${teacher.fullName}: ${assignmentCount} bài tập, ${testCount} bài kiểm tra`);
      }
    }

    // Thống kê theo trạng thái bài tập
    const activeAssignments = await Assignment.countDocuments({ status: 'active' });
    const expiredAssignments = await Assignment.countDocuments({ status: 'expired' });
    console.log(`📊 Bài tập đang hoạt động: ${activeAssignments}`);
    console.log(`📊 Bài tập đã hết hạn: ${expiredAssignments}`);

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra thống kê:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm bài tập và bài kiểm tra
    await addAssignmentsAndTests();
    
    // Kiểm tra thống kê
    await checkStats();
    
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
  addAssignmentsAndTests,
  checkStats,
  teacherEmails,
  assignmentTemplates,
  testTemplates
};
