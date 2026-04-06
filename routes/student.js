const express = require('express');
const router = express.Router();
const { ensureStudent } = require('../middleware/auth');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/dashboard', ensureStudent, async (req, res) => {
  try {
    const myClasses = await Class.find({ students: req.user._id, isActive: true }).populate('course').populate('teacher');
    const classIds = myClasses.map(c => c._id);
    const assignments = await Assignment.find({ class: { $in: classIds } }).sort({ dueDate: 1 }).limit(5);
    const unreadMessages = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.render('student/dashboard', {
      title: 'Student Dashboard',
      user: req.user,
      myClasses,
      assignments,
      stats: { classes: myClasses.length, unreadMessages },
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.get('/messages', ensureStudent, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isActive: true });
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender receiver').sort({ createdAt: -1 }).limit(50);
    await Message.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
    res.render('student/messages', {
      title: 'Messages',
      user: req.user,
      teachers,
      messages,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

module.exports = router;
