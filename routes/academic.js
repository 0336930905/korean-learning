const express = require('express');
const router = express.Router();
const { ensureAdmin, ensureTeacher } = require('../middleware/auth');
const Course = require('../models/Course');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Courses
router.get('/courses', ensureTeacher, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.render('academic/courses', { title: 'Courses', user: req.user, courses, error: req.flash('error'), success: req.flash('success') });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.post('/courses', ensureAdmin, async (req, res) => {
  try {
    const { name, description, level, duration, price } = req.body;
    await Course.create({ name, description, level, duration, price });
    req.flash('success', 'Course created');
    res.redirect('/academic/courses');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/academic/courses');
  }
});

router.post('/courses/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    req.flash('success', 'Course deleted');
    res.redirect('/academic/courses');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/academic/courses');
  }
});

// Classes
router.get('/classes', ensureTeacher, async (req, res) => {
  try {
    const classes = await Class.find().populate('course').populate('teacher').sort({ createdAt: -1 });
    const courses = await Course.find({ isActive: true });
    const teachers = await User.find({ role: 'teacher', isActive: true });
    res.render('academic/classes', { title: 'Classes', user: req.user, classes, courses, teachers, error: req.flash('error'), success: req.flash('success') });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.post('/classes', ensureAdmin, async (req, res) => {
  try {
    const { name, course, teacher, schedule, startDate, endDate } = req.body;
    await Class.create({ name, course, teacher, schedule, startDate, endDate });
    req.flash('success', 'Class created');
    res.redirect('/academic/classes');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/academic/classes');
  }
});

// Assignments
router.get('/assignments', ensureTeacher, async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'admin') {
      classes = await Class.find({ isActive: true }).populate('course');
    } else {
      classes = await Class.find({ teacher: req.user._id, isActive: true }).populate('course');
    }
    const assignments = await Assignment.find({ class: { $in: classes.map(c => c._id) } }).populate('class').sort({ createdAt: -1 });
    res.render('academic/assignments', { title: 'Assignments', user: req.user, assignments, classes, error: req.flash('error'), success: req.flash('success') });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.post('/assignments', ensureTeacher, async (req, res) => {
  try {
    const { title, description, classId, dueDate } = req.body;
    await Assignment.create({ title, description, class: classId, dueDate });
    req.flash('success', 'Assignment created');
    res.redirect('/academic/assignments');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/academic/assignments');
  }
});

// Attendance
router.get('/attendance', ensureTeacher, async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'admin') {
      classes = await Class.find({ isActive: true }).populate('course').populate('students');
    } else {
      classes = await Class.find({ teacher: req.user._id, isActive: true }).populate('course').populate('students');
    }
    res.render('academic/attendance', { title: 'Attendance', user: req.user, classes, error: req.flash('error'), success: req.flash('success') });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.post('/attendance', ensureTeacher, async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    await Attendance.create({ class: classId, date, records: JSON.parse(records) });
    req.flash('success', 'Attendance recorded');
    res.redirect('/academic/attendance');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/academic/attendance');
  }
});

module.exports = router;
