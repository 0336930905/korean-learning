const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, (req, res) => {
  const role = req.user.role;
  if (role === 'admin') return res.redirect('/admin/dashboard');
  if (role === 'teacher') return res.redirect('/teacher/dashboard');
  res.redirect('/student/dashboard');
});

module.exports = router;
