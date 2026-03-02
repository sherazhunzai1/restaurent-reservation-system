const { Admin } = require('../models');

exports.loginPage = (req, res) => {
  if (req.session.admin) return res.redirect('/dashboard');
  res.render('pages/login', { layout: false });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({
      where: { username, is_active: true },
    });

    if (!admin || !(await admin.validatePassword(password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

    await admin.update({ last_login: new Date() });

    req.session.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
    };

    req.flash('success', `Welcome back, ${admin.full_name}!`);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'An error occurred during login');
    res.redirect('/auth/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/auth/login');
  });
};

exports.profilePage = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.session.admin.id);
    res.render('pages/profile', { admin, title: 'My Profile' });
  } catch (error) {
    console.error('Profile error:', error);
    req.flash('error', 'Error loading profile');
    res.redirect('/dashboard');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const admin = await Admin.findByPk(req.session.admin.id);
    await admin.update({ full_name, email });
    req.session.admin.full_name = full_name;
    req.session.admin.email = email;
    req.flash('success', 'Profile updated successfully');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Profile update error:', error);
    req.flash('error', 'Error updating profile');
    res.redirect('/auth/profile');
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const admin = await Admin.findByPk(req.session.admin.id);

    if (!(await admin.validatePassword(current_password))) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/auth/profile');
    }

    if (new_password !== confirm_password) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/auth/profile');
    }

    if (new_password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/auth/profile');
    }

    await admin.update({ password: new_password });
    req.flash('success', 'Password changed successfully');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Change password error:', error);
    req.flash('error', 'Error changing password');
    res.redirect('/auth/profile');
  }
};
