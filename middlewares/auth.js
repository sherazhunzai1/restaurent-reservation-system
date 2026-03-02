const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
};

const isSuperAdmin = (req, res, next) => {
  if (req.session && req.session.admin && req.session.admin.role === 'super_admin') {
    return next();
  }
  req.flash('error', 'You do not have permission to access this page');
  res.redirect('/dashboard');
};

const setLocals = (req, res, next) => {
  res.locals.admin = req.session.admin || null;
  res.locals.restaurant = {
    name: process.env.RESTAURANT_NAME || 'Restaurant',
    logo: process.env.RESTAURANT_LOGO || '/uploads/logo.png',
    tagline: process.env.RESTAURANT_TAGLINE || '',
    email: process.env.RESTAURANT_EMAIL || '',
    phone: process.env.RESTAURANT_PHONE || '',
    address: process.env.RESTAURANT_ADDRESS || '',
    currency: process.env.RESTAURANT_CURRENCY || 'USD',
  };
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
};

module.exports = { isAuthenticated, isSuperAdmin, setLocals };
