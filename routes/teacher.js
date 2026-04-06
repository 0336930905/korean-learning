const express = require('express');
const router = express.Router();
const { ensureTeacher } = require('../middleware/auth');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/dashboard', ensureTeacher, async (req, res) => {
  try {
    const myClasses = await Class.find({ teacher: req.user._id, isActive: true }).populate('course');
    const classIds = myClasses.map(c => c._id);
    const assignmentCount = await Assignment.countDocuments({ class: { $in: classIds } });
    const unreadMessages = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.render('teacher/dashboard', {
      title: 'Teacher Dashboard',
      user: req.user,
      myClasses,
      stats: { classes: myClasses.length, assignments: assignmentCount, unreadMessages },
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.get('/messages', ensureTeacher, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true });
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender receiver').sort({ createdAt: -1 }).limit(50);
    await Message.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
    res.render('teacher/messages', {
      title: 'Messages',
      user: req.user,
      students,
      messages,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

module.exports = router;
