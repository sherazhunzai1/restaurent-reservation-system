const { Reservation, OperatingHours, RestaurantSettings } = require('../models');

function generateReservationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RES-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.home = async (req, res) => {
  try {
    const hours = await OperatingHours.findAll({ order: [['day_of_week', 'ASC']] });
    res.render('pages/public/home', {
      layout: 'public-layout',
      title: 'Home',
      hours,
    });
  } catch (error) {
    console.error('Public home error:', error);
    res.render('pages/public/home', {
      layout: 'public-layout',
      title: 'Home',
      hours: [],
    });
  }
};

exports.reservePage = async (req, res) => {
  try {
    const hours = await OperatingHours.findAll({ order: [['day_of_week', 'ASC']] });
    const settings = await RestaurantSettings.findOne() || {};
    res.render('pages/public/reserve', {
      layout: 'public-layout',
      title: 'Reserve a Table',
      hours,
      settings,
    });
  } catch (error) {
    console.error('Reserve page error:', error);
    req.flash('error', 'Error loading reservation page');
    res.redirect('/');
  }
};

exports.submitReservation = async (req, res) => {
  try {
    const settings = await RestaurantSettings.findOne() || {};

    if (!settings.allow_online_reservations) {
      req.flash('error', 'Online reservations are currently unavailable');
      return res.redirect('/reserve');
    }

    const { customer_name, customer_email, customer_phone, party_size, reservation_date, reservation_time, special_requests } = req.body;

    if (!customer_name || !customer_phone || !party_size || !reservation_date || !reservation_time) {
      req.flash('error', 'Please fill in all required fields');
      return res.redirect('/reserve');
    }

    const reservation = await Reservation.create({
      reservation_code: generateReservationCode(),
      customer_name,
      customer_email: customer_email || null,
      customer_phone,
      party_size: parseInt(party_size),
      reservation_date,
      reservation_time,
      status: settings.auto_confirm_reservations ? 'confirmed' : 'pending',
      special_requests: special_requests || null,
      source: 'online',
    });

    res.render('pages/public/confirmation', {
      layout: 'public-layout',
      title: 'Reservation Confirmed',
      reservation,
    });
  } catch (error) {
    console.error('Submit reservation error:', error);
    req.flash('error', 'Error creating reservation: ' + error.message);
    res.redirect('/reserve');
  }
};
