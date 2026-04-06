exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).render('error', { message: 'Access denied: Admins only', user: req.user });
};

exports.ensureTeacher = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'teacher' || req.user.role === 'admin')) return next();
  res.status(403).render('error', { message: 'Access denied: Teachers only', user: req.user });
};

exports.ensureStudent = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please log in');
  res.redirect('/auth/login');
};
