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

// Hàm thêm bài tập và kiểm tra bằng MongoDB native
const addAssignmentsAndTestsNative = async () => {
  try {
    console.log('🚀 Bắt đầu thêm bài tập và bài kiểm tra cho các lớp học...');
    console.log(`👨‍🏫 Giảng viên được chỉ định: ${teacherEmails.join(', ')}`);

    const db = mongoose.connection.db;

    // Tìm các giảng viên được chỉ định
    const teachers = await db.collection('users').find({ 
      email: { $in: teacherEmails },
      role: 'teacher'
    }).toArray();

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
      const classes = await db.collection('classes').find({ teacher: teacher._id }).toArray();
      
      if (classes.length === 0) {
        console.log(`⚠️  Giảng viên ${teacher.fullName} không có lớp học nào, bỏ qua...`);
        continue;
      }

      console.log(`🏫 Tìm thấy ${classes.length} lớp học`);

      // Thêm bài tập và kiểm tra cho từng lớp
      for (const classData of classes) {
        console.log(`\n🏫 Xử lý lớp: ${classData.name}`);
        console.log(`   👥 Số học sinh: ${classData.students?.length || 0}`);

        // Thêm 7 bài tập
        console.log('   📝 Thêm bài tập...');
        let assignmentCount = 0;
        
        for (const template of assignmentTemplates) {
          // Kiểm tra bài tập đã tồn tại chưa
          const existingAssignment = await db.collection('assignments').findOne({
            title: template.title,
            class: classData._id,
            createdBy: teacher._id
          });

          if (existingAssignment) {
            console.log(`⚠️  Bài tập "${template.title}" đã tồn tại, bỏ qua...`);
            continue;
          }

          // Tính ngày giao và deadline
          const dueDate = calculateDate(classData.startDate, template.weekOffset);
          
          // Tạo bài tập mới
          const newAssignment = {
            title: template.title,
            description: template.description,
            dueDate: dueDate,
            class: classData._id,
            createdBy: teacher._id,
            createdAt: new Date(),
            maxScore: 10,
            status: dueDate > new Date() ? 'active' : 'expired',
            submissionStats: {
              totalSubmissions: 0,
              gradedSubmissions: 0,
              averageScore: 0
            }
          };

          await db.collection('assignments').insertOne(newAssignment);
          assignmentCount++;
          totalAssignments++;
          
          console.log(`     ✅ "${template.title}"`);
        }

        // Thêm 3 bài kiểm tra  
        console.log('   🎯 Thêm bài kiểm tra...');
        let testCount = 0;
        
        for (const template of testTemplates) {
          // Kiểm tra bài kiểm tra đã tồn tại chưa
          const existingTest = await db.collection('classtests').findOne({
            testName: template.title,
            class: classData._id,
            createdBy: teacher._id
          });

          if (existingTest) {
            console.log(`⚠️  Bài kiểm tra "${template.title}" đã tồn tại, bỏ qua...`);
            continue;
          }

          // Tính ngày kiểm tra
          const testDate = calculateDate(classData.startDate, template.weekOffset, true);
          
          // Tạo bài kiểm tra mới
          const newTest = {
            testName: template.title,
            testDate: testDate,
            class: classData._id,
            createdBy: teacher._id,
            createdAt: new Date(),
            maxScore: 10,
            scores: [] // Sẽ được thêm điểm sau khi học sinh làm bài
          };

          await db.collection('classtests').insertOne(newTest);
          testCount++;
          totalTests++;
          
          console.log(`     ✅ "${template.title}"`);
        }

        totalClasses++;
        console.log(`   ✅ Hoàn thành lớp "${classData.name}": ${assignmentCount} bài tập, ${testCount} bài kiểm tra`);
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
const checkFinalStats = async () => {
  try {
    console.log('\n📈 THỐNG KÊ SAU KHI THÊM:');
    console.log('-'.repeat(50));

    const db = mongoose.connection.db;

    // Thống kê tổng quan
    const totalAssignments = await db.collection('assignments').countDocuments();
    const totalTests = await db.collection('classtests').countDocuments();
    console.log(`📝 Tổng số bài tập trong hệ thống: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra trong hệ thống: ${totalTests}`);

    // Thống kê theo giảng viên
    console.log('\n👨‍🏫 THỐNG KÊ THEO GIẢNG VIÊN:');
    console.log('-'.repeat(30));
    
    for (const email of teacherEmails) {
      const teacher = await db.collection('users').findOne({ email, role: 'teacher' });
      if (teacher) {
        const assignmentCount = await db.collection('assignments').countDocuments({ createdBy: teacher._id });
        const testCount = await db.collection('classtests').countDocuments({ createdBy: teacher._id });
        console.log(`👨‍🏫 ${teacher.fullName}:`);
        console.log(`   📝 Bài tập: ${assignmentCount}`);
        console.log(`   🎯 Kiểm tra: ${testCount}`);
      }
    }

    // Thống kê theo trạng thái bài tập
    const activeAssignments = await db.collection('assignments').countDocuments({ status: 'active' });
    const expiredAssignments = await db.collection('assignments').countDocuments({ status: 'expired' });
    console.log(`\n📊 TRẠNG THÁI BÀI TẬP:`);
    console.log(`✅ Đang hoạt động: ${activeAssignments}`);
    console.log(`⏰ Đã hết hạn: ${expiredAssignments}`);

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
    await addAssignmentsAndTestsNative();
    
    // Kiểm tra thống kê
    await checkFinalStats();
    
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
  addAssignmentsAndTestsNative,
  checkFinalStats,
  teacherEmails,
  assignmentTemplates,
  testTemplates
};
