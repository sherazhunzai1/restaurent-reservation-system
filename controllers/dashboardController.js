const { Op } = require('sequelize');
const moment = require('moment');
const { Reservation, Table, sequelize } = require('../models');

exports.index = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
    const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
    const endOfYear = moment().endOf('year').format('YYYY-MM-DD');

    // Today's stats
    const todayReservations = await Reservation.count({
      where: { reservation_date: today },
    });
    const todayConfirmed = await Reservation.count({
      where: { reservation_date: today, status: 'confirmed' },
    });
    const todayPending = await Reservation.count({
      where: { reservation_date: today, status: 'pending' },
    });
    const todaySeated = await Reservation.count({
      where: { reservation_date: today, status: 'seated' },
    });
    const todayCancelled = await Reservation.count({
      where: { reservation_date: today, status: 'cancelled' },
    });
    const todayCompleted = await Reservation.count({
      where: { reservation_date: today, status: 'completed' },
    });
    const todayNoShow = await Reservation.count({
      where: { reservation_date: today, status: 'no_show' },
    });
    const todayGuests = await Reservation.sum('party_size', {
      where: {
        reservation_date: today,
        status: { [Op.in]: ['confirmed', 'seated', 'completed'] },
      },
    }) || 0;

    // Monthly stats
    const monthlyReservations = await Reservation.count({
      where: {
        reservation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
    });
    const monthlyGuests = await Reservation.sum('party_size', {
      where: {
        reservation_date: { [Op.between]: [startOfMonth, endOfMonth] },
        status: { [Op.in]: ['confirmed', 'seated', 'completed'] },
      },
    }) || 0;

    // Yearly stats
    const yearlyReservations = await Reservation.count({
      where: {
        reservation_date: { [Op.between]: [startOfYear, endOfYear] },
      },
    });
    const yearlyGuests = await Reservation.sum('party_size', {
      where: {
        reservation_date: { [Op.between]: [startOfYear, endOfYear] },
        status: { [Op.in]: ['confirmed', 'seated', 'completed'] },
      },
    }) || 0;

    // Table stats
    const totalTables = await Table.count({ where: { is_active: true } });
    const totalCapacity = await Table.sum('capacity', { where: { is_active: true } }) || 0;

    // Upcoming reservations (today and future, limit 10)
    const upcomingReservations = await Reservation.findAll({
      where: {
        reservation_date: { [Op.gte]: today },
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      include: [{ model: Table, as: 'table' }],
      order: [['reservation_date', 'ASC'], ['reservation_time', 'ASC']],
      limit: 10,
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = moment().subtract(i, 'months').startOf('month').format('YYYY-MM-DD');
      const monthEnd = moment().subtract(i, 'months').endOf('month').format('YYYY-MM-DD');
      const count = await Reservation.count({
        where: {
          reservation_date: { [Op.between]: [monthStart, monthEnd] },
        },
      });
      monthlyTrend.push({
        month: moment().subtract(i, 'months').format('MMM YYYY'),
        count,
      });
    }

    // Status distribution for current month
    const statusDistribution = await Reservation.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        reservation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      },
      group: ['status'],
      raw: true,
    });

    res.render('pages/dashboard', {
      title: 'Dashboard',
      today: {
        total: todayReservations,
        confirmed: todayConfirmed,
        pending: todayPending,
        seated: todaySeated,
        cancelled: todayCancelled,
        completed: todayCompleted,
        noShow: todayNoShow,
        guests: todayGuests,
      },
      monthly: {
        total: monthlyReservations,
        guests: monthlyGuests,
      },
      yearly: {
        total: yearlyReservations,
        guests: yearlyGuests,
      },
      tables: {
        total: totalTables,
        capacity: totalCapacity,
      },
      upcomingReservations,
      monthlyTrend,
      statusDistribution,
      moment,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'Error loading dashboard');
    res.render('pages/dashboard', {
      title: 'Dashboard',
      today: { total: 0, confirmed: 0, pending: 0, seated: 0, cancelled: 0, completed: 0, noShow: 0, guests: 0 },
      monthly: { total: 0, guests: 0 },
      yearly: { total: 0, guests: 0 },
      tables: { total: 0, capacity: 0 },
      upcomingReservations: [],
      monthlyTrend: [],
      statusDistribution: [],
      moment,
    });
  }
};
