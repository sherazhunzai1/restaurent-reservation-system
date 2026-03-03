const { Op } = require('sequelize');
const moment = require('moment');
const { Reservation, OperatingHours, RestaurantSettings, Table, TableLocation } = require('../models');

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
    const locations = await TableLocation.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.render('pages/public/reserve', {
      layout: 'public-layout',
      title: 'Reserve a Table',
      hours,
      settings,
      locations,
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

    const { customer_name, customer_email, customer_phone, party_size, reservation_date, reservation_time, location_id, special_requests } = req.body;

    if (!customer_name || !customer_phone || !party_size || !reservation_date || !reservation_time) {
      req.flash('error', 'Please fill in all required fields');
      return res.redirect('/reserve');
    }

    // Auto-assign a table based on location, party size, date, and time
    let assignedTableId = null;
    const size = parseInt(party_size);
    const duration = settings.default_reservation_duration || 90;
    const startMoment = moment(`${reservation_date} ${reservation_time}`, 'YYYY-MM-DD HH:mm');
    const endMoment = moment(startMoment).add(duration, 'minutes');
    const reqStart = startMoment.format('HH:mm:ss');
    const reqEnd = endMoment.format('HH:mm:ss');

    // Find busy tables for this time window
    const conflicting = await Reservation.findAll({
      where: {
        reservation_date,
        status: { [Op.in]: ['pending', 'confirmed', 'seated'] },
      },
      attributes: ['table_id', 'reservation_time', 'end_time'],
      raw: true,
    });

    const busyTableIds = new Set();
    conflicting.forEach(r => {
      if (!r.table_id) return;
      const rStart = r.reservation_time;
      const rEnd = r.end_time || moment(`${reservation_date} ${r.reservation_time}`, 'YYYY-MM-DD HH:mm:ss').add(duration, 'minutes').format('HH:mm:ss');
      if (reqStart < rEnd && reqEnd > rStart) {
        busyTableIds.add(r.table_id);
      }
    });

    const tableWhere = {
      is_active: true,
      capacity: { [Op.gte]: size },
    };
    if (busyTableIds.size > 0) {
      tableWhere.id = { [Op.notIn]: Array.from(busyTableIds) };
    }
    if (location_id) {
      tableWhere.location_id = parseInt(location_id);
    }

    const bestTable = await Table.findOne({
      where: tableWhere,
      order: [['capacity', 'ASC'], ['table_number', 'ASC']],
    });
    if (bestTable) {
      assignedTableId = bestTable.id;
    }

    const reservation = await Reservation.create({
      reservation_code: generateReservationCode(),
      customer_name,
      customer_email: customer_email || null,
      customer_phone,
      party_size: size,
      reservation_date,
      reservation_time,
      table_id: assignedTableId,
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

exports.availableTables = async (req, res) => {
  try {
    const { date, time, party_size } = req.query;

    if (!date || !time || !party_size) {
      return res.json({ tables: [] });
    }

    const size = parseInt(party_size);
    const settings = await RestaurantSettings.findOne() || {};
    const duration = settings.default_reservation_duration || 90;

    // Calculate the time window for this reservation
    const startMoment = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const endMoment = moment(startMoment).add(duration, 'minutes');
    const reqStart = startMoment.format('HH:mm:ss');
    const reqEnd = endMoment.format('HH:mm:ss');

    // Find tables that already have an overlapping reservation on this date
    const conflicting = await Reservation.findAll({
      where: {
        reservation_date: date,
        status: { [Op.in]: ['pending', 'confirmed', 'seated'] },
      },
      attributes: ['table_id', 'reservation_time', 'end_time'],
      raw: true,
    });

    const busyTableIds = new Set();
    conflicting.forEach(r => {
      if (!r.table_id) return;
      const rStart = r.reservation_time;
      const rEnd = r.end_time || moment(`${date} ${r.reservation_time}`, 'YYYY-MM-DD HH:mm:ss').add(duration, 'minutes').format('HH:mm:ss');
      // Check overlap: new start < existing end AND new end > existing start
      if (reqStart < rEnd && reqEnd > rStart) {
        busyTableIds.add(r.table_id);
      }
    });

    // Get all active tables that fit the party size
    const whereClause = {
      is_active: true,
      capacity: { [Op.gte]: size },
    };
    if (busyTableIds.size > 0) {
      whereClause.id = { [Op.notIn]: Array.from(busyTableIds) };
    }

    const tables = await Table.findAll({
      where: whereClause,
      include: [{ model: TableLocation, as: 'location' }],
      order: [['capacity', 'ASC'], ['table_number', 'ASC']],
    });

    res.json({
      tables: tables.map(t => ({
        id: t.id,
        table_number: t.table_number,
        capacity: t.capacity,
        location_name: t.location ? t.location.name : null,
        location_icon: t.location ? t.location.icon : null,
      })),
    });
  } catch (error) {
    console.error('Available tables error:', error);
    res.json({ tables: [] });
  }
};
