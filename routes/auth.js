const express = require('express');
const router = express.Router();
const passport = require('passport');

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');
  res.render('auth/login', { title: 'Login', error: req.flash('error'), success: req.flash('success') });
});

// POST /auth/login
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/auth/login',
  failureFlash: true
}), (req, res) => {
  const role = req.user.role;
  if (role === 'admin') return res.redirect('/admin/dashboard');
  if (role === 'teacher') return res.redirect('/teacher/dashboard');
  res.redirect('/student/dashboard');
});

// GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login',
  failureFlash: true
}), (req, res) => {
  const role = req.user.role;
  if (role === 'admin') return res.redirect('/admin/dashboard');
  if (role === 'teacher') return res.redirect('/teacher/dashboard');
  res.redirect('/student/dashboard');
});

// POST /auth/logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully');
    res.redirect('/auth/login');
  });
});

module.exports = router;
