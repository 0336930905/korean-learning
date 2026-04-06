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

// Hàm kiểm tra dữ liệu bằng MongoDB native
const checkTeacherClasses = async () => {
  try {
    console.log('🔍 KIỂM TRA GIẢNG VIÊN VÀ LỚP HỌC');
    console.log('='.repeat(60));

    const db = mongoose.connection.db;

    // Danh sách email giảng viên
    const teacherEmails = [
      'teacher1@example.com',
      'teacher2@example.com', 
      'teacher3@example.com',
      'teacher4@example.com',
      'teacher5@example.com'
    ];

    // Kiểm tra giảng viên
    console.log('\n👨‍🏫 THÔNG TIN GIẢNG VIÊN:');
    console.log('-'.repeat(50));

    for (const email of teacherEmails) {
      const teacher = await db.collection('users').findOne({ 
        email: email, 
        role: 'teacher' 
      });

      if (teacher) {
        console.log(`✅ ${teacher.fullName} (${email}) - ID: ${teacher._id}`);
        
        // Kiểm tra lớp học của giảng viên này
        const classes = await db.collection('classes').find({ 
          teacher: teacher._id 
        }).toArray();

        console.log(`   🏫 Số lớp giảng dạy: ${classes.length}`);
        
        if (classes.length > 0) {
          classes.forEach((classItem, index) => {
            console.log(`   ${index + 1}. ${classItem.name}`);
            console.log(`      👥 Số học sinh: ${classItem.students ? classItem.students.length : 0}`);
            console.log(`      📅 Từ ${new Date(classItem.startDate).toLocaleDateString()} đến ${new Date(classItem.endDate).toLocaleDateString()}`);
          });

          // Kiểm tra bài tập và kiểm tra hiện có
          const assignments = await db.collection('assignments').find({ 
            createdBy: teacher._id 
          }).toArray();
          
          const tests = await db.collection('classtests').find({ 
            createdBy: teacher._id 
          }).toArray();

          console.log(`   📝 Bài tập hiện có: ${assignments.length}`);
          console.log(`   🎯 Bài kiểm tra hiện có: ${tests.length}`);
        }
      } else {
        console.log(`❌ Không tìm thấy giảng viên: ${email}`);
      }
      console.log('');
    }

    // Thống kê tổng quan
    console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
    console.log('-'.repeat(50));
    
    const totalTeachers = await db.collection('users').countDocuments({ role: 'teacher' });
    const totalClasses = await db.collection('classes').countDocuments();
    const totalAssignments = await db.collection('assignments').countDocuments();
    const totalTests = await db.collection('classtests').countDocuments();

    console.log(`👨‍🏫 Tổng số giảng viên: ${totalTeachers}`);
    console.log(`🏫 Tổng số lớp học: ${totalClasses}`);
    console.log(`📝 Tổng số bài tập: ${totalAssignments}`);
    console.log(`🎯 Tổng số bài kiểm tra: ${totalTests}`);

    // Kiểm tra phân bố bài tập theo giảng viên
    console.log('\n📝 PHÂN BỐ BÀI TẬP THEO GIẢNG VIÊN:');
    console.log('-'.repeat(50));

    const assignmentsByTeacher = await db.collection('assignments').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $group: {
          _id: '$teacher.email',
          teacherName: { $first: '$teacher.fullName' },
          assignmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { assignmentCount: -1 }
      }
    ]).toArray();

    assignmentsByTeacher.forEach(item => {
      console.log(`📝 ${item.teacherName} (${item._id}): ${item.assignmentCount} bài tập`);
    });

    // Kiểm tra phân bố bài kiểm tra theo giảng viên
    console.log('\n🎯 PHÂN BỐ BÀI KIỂM TRA THEO GIẢNG VIÊN:');
    console.log('-'.repeat(50));

    const testsByTeacher = await db.collection('classtests').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $group: {
          _id: '$teacher.email',
          teacherName: { $first: '$teacher.fullName' },
          testCount: { $sum: 1 }
        }
      },
      {
        $sort: { testCount: -1 }
      }
    ]).toArray();

    testsByTeacher.forEach(item => {
      console.log(`🎯 ${item.teacherName} (${item._id}): ${item.testCount} bài kiểm tra`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error);
  }
};

// Hàm chính
const main = async () => {
  try {
    // Kết nối database
    await connectDB();
    
    // Kiểm tra giảng viên và lớp học
    await checkTeacherClasses();
    
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
  checkTeacherClasses
};
