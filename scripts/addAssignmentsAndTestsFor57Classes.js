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

// Template 7 bài tập cho mỗi lớp
const assignmentTemplates = [
  {
    title: "Bài tập tuần 1: Giới thiệu bản thân",
    description: "Viết một đoạn văn ngắn giới thiệu về bản thân bằng tiếng Hàn, bao gồm tên, tuổi, quê quán và sở thích. Yêu cầu sử dụng ít nhất 10 câu hoàn chỉnh.",
    weekOffset: 1
  },
  {
    title: "Bài tập tuần 2: Từ vựng về gia đình",
    description: "Học thuộc 20 từ vựng về các thành viên trong gia đình và tạo câu với mỗi từ. Ghi âm phát âm và nộp file âm thanh.",
    weekOffset: 2
  },
  {
    title: "Bài tập tuần 3: Ngữ pháp cơ bản",
    description: "Luyện tập các cấu trúc ngữ pháp cơ bản: 이/가, 은/는, 을/를. Làm 15 câu ví dụ cho mỗi trợ từ và giải thích cách sử dụng.",
    weekOffset: 3
  },
  {
    title: "Bài tập tuần 4: Hội thoại hàng ngày",
    description: "Thực hành hội thoại về chủ đề mua sắm tại cửa hàng. Ghi âm đoạn hội thoại 5-7 phút với bạn cùng lớp hoặc tự diễn hai vai.",
    weekOffset: 4
  },
  {
    title: "Bài tập tuần 5: Viết thư cảm ơn",
    description: "Viết một lá thư cảm ơn bằng tiếng Hàn cho bạn bè hoặc gia đình (200-300 từ), áp dụng các cấu trúc lịch sự và ngôn ngữ trang trọng.",
    weekOffset: 5
  },
  {
    title: "Bài tập tuần 6: Văn hóa Hàn Quốc",
    description: "Nghiên cứu và viết báo cáo về một khía cạnh văn hóa Hàn Quốc mà bạn quan tâm (1000-1500 từ). Bao gồm hình ảnh minh họa và nguồn tham khảo.",
    weekOffset: 6
  },
  {
    title: "Bài tập cuối kỳ: Dự án tổng hợp",
    description: "Tạo một video thuyết trình 10-15 phút về chủ đề tự chọn liên quan đến Hàn Quốc, sử dụng tất cả kiến thức ngôn ngữ và văn hóa đã học.",
    weekOffset: 7
  }
];

// Template 3 bài kiểm tra cho mỗi lớp
const testTemplates = [
  {
    title: "Kiểm tra giữa kỳ - Phần 1: Từ vựng và Ngữ pháp",
    description: "Kiểm tra từ vựng cơ bản, ngữ pháp và khả năng tạo câu. Thời gian: 60 phút.",
    weekOffset: 4
  },
  {
    title: "Kiểm tra giữa kỳ - Phần 2: Nghe và Nói", 
    description: "Kiểm tra kỹ năng nghe hiểu và giao tiếp bằng tiếng Hàn. Thời gian: 45 phút.",
    weekOffset: 8
  },
  {
    title: "Kiểm tra cuối kỳ: Tổng hợp tất cả kỹ năng",
    description: "Kiểm tra tổng hợp bao gồm nghe, nói, đọc, viết và hiểu biết văn hóa. Thời gian: 90 phút.",
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

// Hàm thêm bài tập và bài kiểm tra cho 57 lớp học
const addAssignmentsAndTestsFor57Classes = async () => {
  try {
    console.log('🚀 BẮT ĐẦU THÊM BÀI TẬP VÀ BÀI KIỂM TRA CHO 57 LỚP HỌC');
    console.log('='.repeat(80));
    console.log(`👨‍🏫 Giảng viên được chỉ định: ${teacherEmails.join(', ')}`);

    const db = mongoose.connection.db;

    // Tìm tất cả các lớp học của 5 giảng viên
    const teachers = await db.collection('users').find({ 
      email: { $in: teacherEmails },
      role: 'teacher'
    }).toArray();

    if (teachers.length === 0) {
      console.log('❌ Không tìm thấy giảng viên nào!');
      return;
    }

    console.log(`👨‍🏫 Tìm thấy ${teachers.length} giảng viên được chỉ định`);

    // Lấy tất cả lớp học của các giảng viên này
    const teacherIds = teachers.map(t => t._id);
    const allClasses = await db.collection('classes').find({ 
      teacher: { $in: teacherIds }
    }).toArray();

    console.log(`🏫 Tổng số lớp học tìm thấy: ${allClasses.length}`);
    
    if (allClasses.length === 0) {
      console.log('❌ Không tìm thấy lớp học nào!');
      return;
    }

    // Tạo map giảng viên để dễ tra cứu
    const teacherMap = {};
    teachers.forEach(teacher => {
      teacherMap[teacher._id.toString()] = teacher;
    });

    let totalAssignmentsAdded = 0;
    let totalTestsAdded = 0;
    let processedClasses = 0;

    console.log('\n📝 BẮT ĐẦU XỬ LÝ TỪNG LỚP HỌC:');
    console.log('-'.repeat(60));

    // Xử lý từng lớp học
    for (const classItem of allClasses) {
      const teacher = teacherMap[classItem.teacher.toString()];
      if (!teacher) {
        console.log(`⚠️  Không tìm thấy thông tin giảng viên cho lớp ${classItem.name}`);
        continue;
      }

      console.log(`\n🏫 Lớp ${processedClasses + 1}/${allClasses.length}: ${classItem.name}`);
      console.log(`   👨‍🏫 Giảng viên: ${teacher.fullName}`);
      console.log(`   👥 Số học sinh: ${classItem.students?.length || 0}`);

      // THÊM 7 BÀI TẬP
      console.log('   📝 Thêm 7 bài tập...');
      let assignmentCount = 0;
      
      for (const template of assignmentTemplates) {
        // Kiểm tra bài tập đã tồn tại chưa
        const existingAssignment = await db.collection('assignments').findOne({
          title: template.title,
          class: classItem._id,
          createdBy: teacher._id
        });

        if (existingAssignment) {
          console.log(`     ⚠️  "${template.title}" đã tồn tại, bỏ qua`);
          continue;
        }

        // Tính ngày giao và deadline
        const dueDate = calculateDate(classItem.startDate, template.weekOffset);
        
        // Tạo bài tập mới
        const newAssignment = {
          title: template.title,
          description: template.description,
          dueDate: dueDate,
          class: classItem._id,
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
        totalAssignmentsAdded++;
        
        console.log(`     ✅ "${template.title}"`);
      }

      // THÊM 3 BÀI KIỂM TRA  
      console.log('   🎯 Thêm 3 bài kiểm tra...');
      let testCount = 0;
      
      for (const template of testTemplates) {
        // Kiểm tra bài kiểm tra đã tồn tại chưa
        const existingTest = await db.collection('classtests').findOne({
          testName: template.title,
          class: classItem._id,
          createdBy: teacher._id
        });

        if (existingTest) {
          console.log(`     ⚠️  "${template.title}" đã tồn tại, bỏ qua`);
          continue;
        }

        // Tính ngày kiểm tra
        const testDate = calculateDate(classItem.startDate, template.weekOffset, true);
        
        // Tạo bài kiểm tra mới
        const newTest = {
          testName: template.title,
          testDate: testDate,
          class: classItem._id,
          createdBy: teacher._id,
          createdAt: new Date(),
          maxScore: 10,
          scores: [] // Sẽ được thêm điểm sau khi học sinh làm bài
        };

        await db.collection('classtests').insertOne(newTest);
        testCount++;
        totalTestsAdded++;
        
        console.log(`     ✅ "${template.title}"`);
      }

      processedClasses++;
      console.log(`   ✅ Hoàn thành: ${assignmentCount} bài tập, ${testCount} bài kiểm tra`);
    }

    // HIỂN THỊ KẾT QUẢ TỔNG KẾT
    console.log('\n📊 KẾT QUẢ TỔNG KẾT:');
    console.log('='.repeat(60));
    console.log(`🏫 Tổng số lớp đã xử lý: ${processedClasses}`);
    console.log(`📝 Tổng số bài tập đã thêm: ${totalAssignmentsAdded}`);
    console.log(`🎯 Tổng số bài kiểm tra đã thêm: ${totalTestsAdded}`);
    console.log(`👨‍🏫 Số giảng viên tham gia: ${teachers.length}`);
    console.log(`📊 Trung bình bài tập/lớp: ${(totalAssignmentsAdded/processedClasses).toFixed(1)}`);
    console.log(`📊 Trung bình kiểm tra/lớp: ${(totalTestsAdded/processedClasses).toFixed(1)}`);

    // Kiểm tra xem có đạt yêu cầu không
    const expectedAssignments = processedClasses * 7;
    const expectedTests = processedClasses * 3;
    
    console.log('\n✅ KIỂM TRA TUÂN THỦ YÊU CẦU:');
    console.log(`📋 Bài tập - Mong đợi: ${expectedAssignments}, Thực tế: ${totalAssignmentsAdded}`);
    console.log(`📋 Kiểm tra - Mong đợi: ${expectedTests}, Thực tế: ${totalTestsAdded}`);
    
    const isCompliant = totalAssignmentsAdded >= expectedAssignments * 0.9 && 
                       totalTestsAdded >= expectedTests * 0.9;
    
    console.log(`\n${isCompliant ? '✅' : '❌'} Kết quả: ${isCompliant ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT YÊU CẦU'}`);

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
    const totalClasses = await db.collection('classes').countDocuments();
    
    console.log(`🏫 Tổng số lớp học trong hệ thống: ${totalClasses}`);
    console.log(`📝 Tổng số bài tập trong hệ thống: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra trong hệ thống: ${totalTests}`);

    // Thống kê theo giảng viên được chỉ định
    console.log('\n👨‍🏫 THỐNG KÊ THEO GIẢNG VIÊN ĐƯỢC CHỈ ĐỊNH:');
    console.log('-'.repeat(40));
    
    for (const email of teacherEmails) {
      const teacher = await db.collection('users').findOne({ email, role: 'teacher' });
      if (teacher) {
        const classCount = await db.collection('classes').countDocuments({ teacher: teacher._id });
        const assignmentCount = await db.collection('assignments').countDocuments({ createdBy: teacher._id });
        const testCount = await db.collection('classtests').countDocuments({ createdBy: teacher._id });
        
        console.log(`👨‍🏫 ${teacher.fullName}:`);
        console.log(`   🏫 Lớp học: ${classCount}`);
        console.log(`   📝 Bài tập: ${assignmentCount} (${(assignmentCount/classCount).toFixed(1)}/lớp)`);
        console.log(`   🎯 Kiểm tra: ${testCount} (${(testCount/classCount).toFixed(1)}/lớp)`);
      }
    }

    // Kiểm tra template được phân bố đều
    console.log('\n📊 PHÂN BỐ TEMPLATE BÀI TẬP:');
    for (const template of assignmentTemplates) {
      const count = await db.collection('assignments').countDocuments({ title: template.title });
      console.log(`📝 "${template.title}": ${count} lớp`);
    }

    console.log('\n📊 PHÂN BỐ TEMPLATE BÀI KIỂM TRA:');
    for (const template of testTemplates) {
      const count = await db.collection('classtests').countDocuments({ testName: template.title });
      console.log(`🎯 "${template.title}": ${count} lớp`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra thống kê:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Thêm bài tập và bài kiểm tra cho 57 lớp học
    await addAssignmentsAndTestsFor57Classes();
    
    // Kiểm tra thống kê
    await checkFinalStats();
    
    console.log('\n🎉 HOÀN THÀNH TẤT CẢ CÁC TÁC VỤ!');
    
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
  addAssignmentsAndTestsFor57Classes,
  checkFinalStats,
  teacherEmails,
  assignmentTemplates,
  testTemplates
};
