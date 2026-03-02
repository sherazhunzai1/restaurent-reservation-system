const { RestaurantSettings, OperatingHours, SpecialDate, Admin } = require('../models');
const bcrypt = require('bcryptjs');

exports.general = async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }
    res.render('pages/settings/general', { title: 'General Settings', settings });
  } catch (error) {
    console.error('Settings error:', error);
    req.flash('error', 'Error loading settings');
    res.redirect('/admin/dashboard');
  }
};

exports.updateGeneral = async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }

    const {
      default_reservation_duration, max_party_size,
      min_advance_booking_hours, max_advance_booking_days,
      time_slot_interval, auto_confirm_reservations,
      allow_online_reservations, cancellation_policy,
    } = req.body;

    await settings.update({
      default_reservation_duration: parseInt(default_reservation_duration) || 90,
      max_party_size: parseInt(max_party_size) || 20,
      min_advance_booking_hours: parseInt(min_advance_booking_hours) || 2,
      max_advance_booking_days: parseInt(max_advance_booking_days) || 30,
      time_slot_interval: parseInt(time_slot_interval) || 30,
      auto_confirm_reservations: auto_confirm_reservations === 'on',
      allow_online_reservations: allow_online_reservations === 'on',
      cancellation_policy: cancellation_policy || null,
    });

    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Settings update error:', error);
    req.flash('error', 'Error updating settings');
    res.redirect('/admin/settings');
  }
};

exports.operatingHours = async (req, res) => {
  try {
    let hours = await OperatingHours.findAll({
      order: [['day_of_week', 'ASC']],
    });

    if (hours.length === 0) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (let i = 0; i < 7; i++) {
        await OperatingHours.create({
          day_of_week: i,
          day_name: days[i],
          is_open: i >= 1 && i <= 6, // Closed on Sunday by default
          opening_time: '11:00',
          closing_time: '22:00',
          last_reservation_time: '21:00',
        });
      }
      hours = await OperatingHours.findAll({
        order: [['day_of_week', 'ASC']],
      });
    }

    res.render('pages/settings/hours', { title: 'Operating Hours', hours });
  } catch (error) {
    console.error('Operating hours error:', error);
    req.flash('error', 'Error loading operating hours');
    res.redirect('/admin/settings');
  }
};

exports.updateOperatingHours = async (req, res) => {
  try {
    const { days } = req.body;

    if (days && typeof days === 'object') {
      for (const [dayId, data] of Object.entries(days)) {
        await OperatingHours.update(
          {
            is_open: data.is_open === 'on',
            opening_time: data.opening_time || '11:00',
            closing_time: data.closing_time || '22:00',
            last_reservation_time: data.last_reservation_time || '21:00',
          },
          { where: { id: parseInt(dayId) } }
        );
      }
    }

    req.flash('success', 'Operating hours updated successfully');
    res.redirect('/admin/settings/hours');
  } catch (error) {
    console.error('Operating hours update error:', error);
    req.flash('error', 'Error updating operating hours');
    res.redirect('/admin/settings/hours');
  }
};

exports.specialDates = async (req, res) => {
  try {
    const specialDates = await SpecialDate.findAll({
      order: [['date', 'ASC']],
    });
    res.render('pages/settings/special-dates', {
      title: 'Special Dates & Holidays',
      specialDates,
    });
  } catch (error) {
    console.error('Special dates error:', error);
    req.flash('error', 'Error loading special dates');
    res.redirect('/admin/settings');
  }
};

exports.storeSpecialDate = async (req, res) => {
  try {
    const { date, title, is_closed, special_opening_time, special_closing_time, notes } = req.body;
    await SpecialDate.create({
      date,
      title,
      is_closed: is_closed === 'on',
      special_opening_time: is_closed === 'on' ? null : (special_opening_time || null),
      special_closing_time: is_closed === 'on' ? null : (special_closing_time || null),
      notes: notes || null,
    });
    req.flash('success', 'Special date added successfully');
    res.redirect('/admin/settings/special-dates');
  } catch (error) {
    console.error('Special date store error:', error);
    req.flash('error', 'Error adding special date');
    res.redirect('/admin/settings/special-dates');
  }
};

exports.deleteSpecialDate = async (req, res) => {
  try {
    await SpecialDate.destroy({ where: { id: req.params.id } });
    req.flash('success', 'Special date removed successfully');
    res.redirect('/admin/settings/special-dates');
  } catch (error) {
    console.error('Special date delete error:', error);
    req.flash('error', 'Error removing special date');
    res.redirect('/admin/settings/special-dates');
  }
};

exports.staffIndex = async (req, res) => {
  try {
    const staff = await Admin.findAll({
      order: [['created_at', 'DESC']],
    });
    res.render('pages/settings/staff', { title: 'Staff Management', staff });
  } catch (error) {
    console.error('Staff index error:', error);
    req.flash('error', 'Error loading staff');
    res.redirect('/admin/settings');
  }
};

exports.storeStaff = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;
    await Admin.create({
      username,
      email,
      password,
      full_name,
      role: role || 'staff',
    });
    req.flash('success', 'Staff member added successfully');
    res.redirect('/admin/settings/staff');
  } catch (error) {
    console.error('Staff store error:', error);
    req.flash('error', 'Error adding staff member: ' + error.message);
    res.redirect('/admin/settings/staff');
  }
};

exports.toggleStaffStatus = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      req.flash('error', 'Staff member not found');
      return res.redirect('/admin/settings/staff');
    }
    if (admin.id === req.session.admin.id) {
      req.flash('error', 'You cannot deactivate your own account');
      return res.redirect('/admin/settings/staff');
    }
    await admin.update({ is_active: !admin.is_active });
    req.flash('success', `Staff member ${admin.is_active ? 'activated' : 'deactivated'} successfully`);
    res.redirect('/admin/settings/staff');
  } catch (error) {
    console.error('Toggle staff error:', error);
    req.flash('error', 'Error updating staff status');
    res.redirect('/admin/settings/staff');
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      req.flash('error', 'Staff member not found');
      return res.redirect('/admin/settings/staff');
    }
    if (admin.id === req.session.admin.id) {
      req.flash('error', 'You cannot delete your own account');
      return res.redirect('/admin/settings/staff');
    }
    await admin.destroy();
    req.flash('success', 'Staff member deleted successfully');
    res.redirect('/admin/settings/staff');
  } catch (error) {
    console.error('Delete staff error:', error);
    req.flash('error', 'Error deleting staff member');
    res.redirect('/admin/settings/staff');
  }
};
