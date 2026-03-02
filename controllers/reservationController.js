const { Op } = require('sequelize');
const moment = require('moment');
const { Reservation, Table, Admin } = require('../models');

function generateReservationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RES-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.index = async (req, res) => {
  try {
    const {
      status, date, date_from, date_to, search, page = 1,
    } = req.query;
    const limit = 15;
    const offset = (page - 1) * limit;
    const where = {};

    if (status && status !== 'all') where.status = status;

    if (date) {
      where.reservation_date = date;
    } else if (date_from || date_to) {
      where.reservation_date = {};
      if (date_from) where.reservation_date[Op.gte] = date_from;
      if (date_to) where.reservation_date[Op.lte] = date_to;
    }

    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
        { reservation_code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: reservations, count: total } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: Table, as: 'table' },
        { model: Admin, as: 'creator', attributes: ['full_name'] },
      ],
      order: [['reservation_date', 'DESC'], ['reservation_time', 'ASC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    res.render('pages/reservations/index', {
      title: 'Reservations',
      reservations,
      filters: { status, date, date_from, date_to, search },
      pagination: {
        page: parseInt(page),
        totalPages,
        total,
        limit,
      },
      moment,
    });
  } catch (error) {
    console.error('Reservations index error:', error);
    req.flash('error', 'Error loading reservations');
    res.redirect('/dashboard');
  }
};

exports.create = async (req, res) => {
  try {
    const tables = await Table.findAll({
      where: { is_active: true },
      order: [['table_number', 'ASC']],
    });
    res.render('pages/reservations/create', {
      title: 'New Reservation',
      tables,
      moment,
    });
  } catch (error) {
    console.error('Reservation create page error:', error);
    req.flash('error', 'Error loading create form');
    res.redirect('/reservations');
  }
};

exports.store = async (req, res) => {
  try {
    const {
      customer_name, customer_email, customer_phone, party_size,
      reservation_date, reservation_time, end_time, table_id,
      status, special_requests, notes, source,
    } = req.body;

    const reservation = await Reservation.create({
      reservation_code: generateReservationCode(),
      customer_name,
      customer_email: customer_email || null,
      customer_phone,
      party_size: parseInt(party_size),
      reservation_date,
      reservation_time,
      end_time: end_time || null,
      table_id: table_id || null,
      status: status || 'pending',
      special_requests: special_requests || null,
      notes: notes || null,
      source: source || 'admin',
      created_by: req.session.admin.id,
    });

    req.flash('success', `Reservation ${reservation.reservation_code} created successfully`);
    res.redirect('/reservations');
  } catch (error) {
    console.error('Reservation store error:', error);
    req.flash('error', 'Error creating reservation: ' + error.message);
    res.redirect('/reservations/create');
  }
};

exports.show = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [
        { model: Table, as: 'table' },
        { model: Admin, as: 'creator', attributes: ['full_name'] },
      ],
    });

    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    res.render('pages/reservations/show', {
      title: `Reservation ${reservation.reservation_code}`,
      reservation,
      moment,
    });
  } catch (error) {
    console.error('Reservation show error:', error);
    req.flash('error', 'Error loading reservation');
    res.redirect('/reservations');
  }
};

exports.edit = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    const tables = await Table.findAll({
      where: { is_active: true },
      order: [['table_number', 'ASC']],
    });

    res.render('pages/reservations/edit', {
      title: `Edit Reservation ${reservation.reservation_code}`,
      reservation,
      tables,
      moment,
    });
  } catch (error) {
    console.error('Reservation edit error:', error);
    req.flash('error', 'Error loading reservation');
    res.redirect('/reservations');
  }
};

exports.update = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    const {
      customer_name, customer_email, customer_phone, party_size,
      reservation_date, reservation_time, end_time, table_id,
      status, special_requests, notes, source,
    } = req.body;

    await reservation.update({
      customer_name,
      customer_email: customer_email || null,
      customer_phone,
      party_size: parseInt(party_size),
      reservation_date,
      reservation_time,
      end_time: end_time || null,
      table_id: table_id || null,
      status,
      special_requests: special_requests || null,
      notes: notes || null,
      source: source || reservation.source,
    });

    req.flash('success', `Reservation ${reservation.reservation_code} updated successfully`);
    res.redirect(`/reservations/${reservation.id}`);
  } catch (error) {
    console.error('Reservation update error:', error);
    req.flash('error', 'Error updating reservation: ' + error.message);
    res.redirect(`/reservations/${req.params.id}/edit`);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    await reservation.update({ status: req.body.status });
    req.flash('success', `Reservation status updated to ${req.body.status}`);
    res.redirect(`/reservations/${reservation.id}`);
  } catch (error) {
    console.error('Status update error:', error);
    req.flash('error', 'Error updating status');
    res.redirect('/reservations');
  }
};

exports.destroy = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    await reservation.destroy();
    req.flash('success', 'Reservation deleted successfully');
    res.redirect('/reservations');
  } catch (error) {
    console.error('Reservation delete error:', error);
    req.flash('error', 'Error deleting reservation');
    res.redirect('/reservations');
  }
};

exports.todayView = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const reservations = await Reservation.findAll({
      where: { reservation_date: today },
      include: [{ model: Table, as: 'table' }],
      order: [['reservation_time', 'ASC']],
    });

    const stats = {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      seated: reservations.filter(r => r.status === 'seated').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length,
      noShow: reservations.filter(r => r.status === 'no_show').length,
      totalGuests: reservations
        .filter(r => ['confirmed', 'seated', 'completed'].includes(r.status))
        .reduce((sum, r) => sum + r.party_size, 0),
    };

    res.render('pages/reservations/today', {
      title: "Today's Reservations",
      reservations,
      stats,
      today,
      moment,
    });
  } catch (error) {
    console.error('Today view error:', error);
    req.flash('error', 'Error loading today\'s reservations');
    res.redirect('/dashboard');
  }
};

exports.calendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) - 1 : moment().month();
    const currentYear = year ? parseInt(year) : moment().year();

    const startDate = moment({ year: currentYear, month: currentMonth }).startOf('month').format('YYYY-MM-DD');
    const endDate = moment({ year: currentYear, month: currentMonth }).endOf('month').format('YYYY-MM-DD');

    const reservations = await Reservation.findAll({
      where: {
        reservation_date: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        'reservation_date',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['reservation_date'],
      raw: true,
    });

    const calendarData = {};
    reservations.forEach(r => {
      calendarData[r.reservation_date] = parseInt(r.count);
    });

    res.render('pages/reservations/calendar', {
      title: 'Reservation Calendar',
      calendarData,
      currentMonth: currentMonth + 1,
      currentYear,
      moment,
    });
  } catch (error) {
    console.error('Calendar error:', error);
    req.flash('error', 'Error loading calendar');
    res.redirect('/dashboard');
  }
};

exports.reports = async (req, res) => {
  try {
    const { period = 'monthly', year = moment().year() } = req.query;

    let reportData = [];
    if (period === 'daily') {
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
      reportData = await Reservation.findAll({
        attributes: [
          'reservation_date',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total'],
          [require('sequelize').fn('SUM', require('sequelize').col('party_size')), 'guests'],
        ],
        where: {
          reservation_date: { [Op.between]: [startOfMonth, endOfMonth] },
        },
        group: ['reservation_date'],
        order: [['reservation_date', 'ASC']],
        raw: true,
      });
    } else if (period === 'monthly') {
      for (let m = 0; m < 12; m++) {
        const start = moment({ year: parseInt(year), month: m }).startOf('month').format('YYYY-MM-DD');
        const end = moment({ year: parseInt(year), month: m }).endOf('month').format('YYYY-MM-DD');
        const total = await Reservation.count({
          where: { reservation_date: { [Op.between]: [start, end] } },
        });
        const guests = await Reservation.sum('party_size', {
          where: {
            reservation_date: { [Op.between]: [start, end] },
            status: { [Op.in]: ['confirmed', 'seated', 'completed'] },
          },
        }) || 0;
        const cancelled = await Reservation.count({
          where: {
            reservation_date: { [Op.between]: [start, end] },
            status: 'cancelled',
          },
        });
        const noShow = await Reservation.count({
          where: {
            reservation_date: { [Op.between]: [start, end] },
            status: 'no_show',
          },
        });
        reportData.push({
          label: moment({ month: m }).format('MMMM'),
          total,
          guests,
          cancelled,
          noShow,
        });
      }
    } else if (period === 'yearly') {
      const currentYear = moment().year();
      for (let y = currentYear - 4; y <= currentYear; y++) {
        const start = moment({ year: y }).startOf('year').format('YYYY-MM-DD');
        const end = moment({ year: y }).endOf('year').format('YYYY-MM-DD');
        const total = await Reservation.count({
          where: { reservation_date: { [Op.between]: [start, end] } },
        });
        const guests = await Reservation.sum('party_size', {
          where: {
            reservation_date: { [Op.between]: [start, end] },
            status: { [Op.in]: ['confirmed', 'seated', 'completed'] },
          },
        }) || 0;
        reportData.push({ label: y.toString(), total, guests });
      }
    }

    // Source distribution
    const sourceStats = await Reservation.findAll({
      attributes: [
        'source',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: {
        reservation_date: {
          [Op.between]: [
            moment({ year: parseInt(year) }).startOf('year').format('YYYY-MM-DD'),
            moment({ year: parseInt(year) }).endOf('year').format('YYYY-MM-DD'),
          ],
        },
      },
      group: ['source'],
      raw: true,
    });

    res.render('pages/reservations/reports', {
      title: 'Reservation Reports',
      reportData,
      sourceStats,
      period,
      year: parseInt(year),
      moment,
    });
  } catch (error) {
    console.error('Reports error:', error);
    req.flash('error', 'Error loading reports');
    res.redirect('/dashboard');
  }
};
