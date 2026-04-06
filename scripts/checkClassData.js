const mongoose = require('mongoose');
require('dotenv').config();

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

const checkData = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    
    console.log('=== KIỂM TRA COLLECTIONS ===');
    const collections = await db.listCollections().toArray();
    console.log('Collections có sẵn:');
    collections.forEach(col => console.log('- ' + col.name));
    
    console.log('\n=== KIỂM TRA DỮ LIỆU CLASSES ===');
    const classCount = await db.collection('classes').countDocuments();
    console.log('Số lớp học:', classCount);
    
    const classes = await db.collection('classes').find({}).limit(5).toArray();
    if (classes.length > 0) {
      console.log('Mẫu lớp học:');
      classes.forEach(cls => {
        console.log(`- ${cls.name} (Course: ${cls.course}, Students: ${cls.students ? cls.students.length : 0})`);
      });
    }
    
    console.log('\n=== KIỂM TRA DỮ LIỆU COURSES ===');
    const courseCount = await db.collection('courses').countDocuments();
    console.log('Số khóa học:', courseCount);
    
    const courses = await db.collection('courses').find({}).limit(5).toArray();
    if (courses.length > 0) {
      console.log('Mẫu khóa học:');
      courses.forEach(course => {
        console.log(`- ${course.title} (ID: ${course._id})`);
      });
    }
    
    // Kiểm tra mối quan hệ course-class
    console.log('\n=== KIỂM TRA MỐI QUAN HỆ COURSE-CLASS ===');
    const pipeline = [
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: 'course',
          as: 'classes'
        }
      },
      {
        $project: {
          title: 1,
          classCount: { $size: '$classes' }
        }
      },
      { $limit: 5 }
    ];
    
    const coursesWithClasses = await db.collection('courses').aggregate(pipeline).toArray();
    console.log('Khóa học và số lớp:');
    coursesWithClasses.forEach(course => {
      console.log(`- ${course.title}: ${course.classCount} lớp`);
    });
    
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nĐã ngắt kết nối database');
  }
};

checkData();
