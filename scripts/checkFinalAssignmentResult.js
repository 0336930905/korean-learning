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

// Hàm kiểm tra kết quả cuối cùng
const checkFinalResult = async () => {
  try {
    console.log('🎯 KIỂM TRA KẾT QUẢ CUỐI CÙNG');
    console.log('='.repeat(70));

    const db = mongoose.connection.db;

    // Danh sách email giảng viên được chỉ định
    const teacherEmails = [
      'teacher1@example.com',
      'teacher2@example.com', 
      'teacher3@example.com',
      'teacher4@example.com',
      'teacher5@example.com'
    ];

    console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
    console.log('-'.repeat(50));

    const totalAssignments = await db.collection('assignments').countDocuments();
    const totalTests = await db.collection('classtests').countDocuments();
    const totalClasses = await db.collection('classes').countDocuments();
    const totalTeachers = await db.collection('users').countDocuments({ role: 'teacher' });
    const totalStudents = await db.collection('users').countDocuments({ role: 'student' });

    console.log(`🏫 Tổng số lớp học: ${totalClasses}`);
    console.log(`👨‍🏫 Tổng số giảng viên: ${totalTeachers}`);
    console.log(`👥 Tổng số học sinh: ${totalStudents}`);
    console.log(`📝 Tổng số bài tập: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra: ${totalTests}`);

    console.log('\n👨‍🏫 CHI TIẾT THEO GIẢNG VIÊN ĐƯỢC CHỈ ĐỊNH:');
    console.log('-'.repeat(60));

    let totalAssignmentsForTeachers = 0;
    let totalTestsForTeachers = 0;
    let totalClassesForTeachers = 0;

    for (const email of teacherEmails) {
      const teacher = await db.collection('users').findOne({ 
        email: email, 
        role: 'teacher' 
      });

      if (teacher) {
        console.log(`\n👨‍🏫 ${teacher.fullName} (${email}):`);
        
        // Lấy lớp học của giảng viên
        const classes = await db.collection('classes').find({ 
          teacher: teacher._id 
        }).toArray();
        
        console.log(`   🏫 Số lớp giảng dạy: ${classes.length}`);
        totalClassesForTeachers += classes.length;

        // Lấy bài tập của giảng viên
        const assignments = await db.collection('assignments').find({ 
          createdBy: teacher._id 
        }).toArray();
        
        console.log(`   📝 Số bài tập đã tạo: ${assignments.length}`);
        totalAssignmentsForTeachers += assignments.length;

        // Lấy bài kiểm tra của giảng viên
        const tests = await db.collection('classtests').find({ 
          createdBy: teacher._id 
        }).toArray();
        
        console.log(`   🎯 Số bài kiểm tra đã tạo: ${tests.length}`);
        totalTestsForTeachers += tests.length;

        // Kiểm tra phân bố bài tập theo lớp
        if (classes.length > 0) {
          console.log('   📋 Chi tiết theo lớp:');
          
          for (const classItem of classes.slice(0, 3)) { // Hiển thị 3 lớp đầu tiên
            const classAssignments = await db.collection('assignments').countDocuments({
              class: classItem._id,
              createdBy: teacher._id
            });
            
            const classTests = await db.collection('classtests').countDocuments({
              class: classItem._id,
              createdBy: teacher._id
            });
            
            console.log(`      🏫 ${classItem.name}: ${classAssignments} bài tập, ${classTests} kiểm tra`);
          }
          
          if (classes.length > 3) {
            console.log(`      ... và ${classes.length - 3} lớp khác`);
          }
        }

        // Kiểm tra trạng thái bài tập
        const activeAssignments = await db.collection('assignments').countDocuments({
          createdBy: teacher._id,
          status: 'active'
        });
        
        const expiredAssignments = await db.collection('assignments').countDocuments({
          createdBy: teacher._id,
          status: 'expired'
        });

        console.log(`   📊 Bài tập đang hoạt động: ${activeAssignments}`);
        console.log(`   📊 Bài tập đã hết hạn: ${expiredAssignments}`);
      }
    }

    console.log('\n📈 TỔNG KẾT CHO CÁC GIẢNG VIÊN ĐƯỢC CHỈ ĐỊNH:');
    console.log('-'.repeat(60));
    console.log(`🏫 Tổng số lớp: ${totalClassesForTeachers}`);
    console.log(`📝 Tổng số bài tập: ${totalAssignmentsForTeachers}`);
    console.log(`🎯 Tổng số bài kiểm tra: ${totalTestsForTeachers}`);
    console.log(`📊 Trung bình bài tập/lớp: ${(totalAssignmentsForTeachers/totalClassesForTeachers).toFixed(1)}`);
    console.log(`📊 Trung bình kiểm tra/lớp: ${(totalTestsForTeachers/totalClassesForTeachers).toFixed(1)}`);

    // Kiểm tra template bài tập
    console.log('\n📝 KIỂM TRA TEMPLATE BÀI TẬP:');
    console.log('-'.repeat(50));
    
    const assignmentTitles = [
      "Bài tập tuần 1: Giới thiệu bản thân",
      "Bài tập tuần 2: Từ vựng về gia đình", 
      "Bài tập tuần 3: Ngữ pháp cơ bản",
      "Bài tập tuần 4: Hội thoại hàng ngày",
      "Bài tập tuần 5: Viết thư cảm ơn",
      "Bài tập tuần 6: Văn hóa Hàn Quốc",
      "Bài tập cuối kỳ: Dự án tổng hợp"
    ];

    for (const title of assignmentTitles) {
      const count = await db.collection('assignments').countDocuments({ title });
      console.log(`📝 "${title}": ${count} lớp`);
    }

    // Kiểm tra template bài kiểm tra
    console.log('\n🎯 KIỂM TRA TEMPLATE BÀI KIỂM TRA:');
    console.log('-'.repeat(50));
    
    const testTitles = [
      "Kiểm tra giữa kỳ - Phần 1",
      "Kiểm tra giữa kỳ - Phần 2",
      "Kiểm tra cuối kỳ"
    ];

    for (const title of testTitles) {
      const count = await db.collection('classtests').countDocuments({ testName: title });
      console.log(`🎯 "${title}": ${count} lớp`);
    }

    // So sánh với yêu cầu
    console.log('\n✅ KIỂM TRA TUÂN THỦ YÊU CẦU:');
    console.log('-'.repeat(50));
    console.log(`📋 Yêu cầu: 7 bài tập cho mỗi lớp`);
    console.log(`📋 Thực tế: ${(totalAssignmentsForTeachers/totalClassesForTeachers).toFixed(1)} bài tập/lớp`);
    console.log(`📋 Yêu cầu: 3 bài kiểm tra cho mỗi lớp`);
    console.log(`📋 Thực tế: ${(totalTestsForTeachers/totalClassesForTeachers).toFixed(1)} bài kiểm tra/lớp`);

    const isCompliant = (totalAssignmentsForTeachers/totalClassesForTeachers) >= 7 && 
                       (totalTestsForTeachers/totalClassesForTeachers) >= 3;
    
    console.log(`\n${isCompliant ? '✅' : '❌'} Kết quả: ${isCompliant ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT YÊU CẦU'}`);

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra kết quả:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Kiểm tra kết quả cuối cùng
    await checkFinalResult();
    
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
  checkFinalResult
};
