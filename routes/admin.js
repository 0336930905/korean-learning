const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Class = require('../models/Class');

router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalClasses] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Class.countDocuments()
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: { totalUsers, totalCourses, totalClasses },
      recentUsers,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', {
      title: 'Manage Users',
      user: req.user,
      users,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

router.post('/users', ensureAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already exists');
      return res.redirect('/admin/users');
    }
    await User.create({ name, email, password, role });
    req.flash('success', 'User created successfully');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/users');
  }
});

router.post('/users/:id/toggle', ensureAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) { req.flash('error', 'User not found'); return res.redirect('/admin/users'); }
    u.isActive = !u.isActive;
    await u.save();
    req.flash('success', `User ${u.isActive ? 'activated' : 'deactivated'}`);
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/users');
  }
});

router.post('/users/:id/delete', ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin/users');
  }
});

router.get('/reports', ensureAdmin, async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const courseCount = await Course.countDocuments();
    const classCount = await Class.countDocuments();
    res.render('admin/reports', {
      title: 'Reports',
      user: req.user,
      usersByRole,
      courseCount,
      classCount,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
});

module.exports = router;
