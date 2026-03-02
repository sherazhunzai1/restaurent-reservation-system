const { Table, Reservation } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.index = async (req, res) => {
  try {
    const tables = await Table.findAll({
      order: [['table_number', 'ASC']],
    });

    // Get today's reservation counts per table
    const today = moment().format('YYYY-MM-DD');
    const todayReservations = await Reservation.findAll({
      where: {
        reservation_date: today,
        status: { [Op.in]: ['pending', 'confirmed', 'seated'] },
      },
      include: [{ model: Table, as: 'table' }],
    });

    const tableReservationCounts = {};
    todayReservations.forEach(r => {
      if (r.table_id) {
        tableReservationCounts[r.table_id] = (tableReservationCounts[r.table_id] || 0) + 1;
      }
    });

    res.render('pages/tables/index', {
      title: 'Table Management',
      tables,
      tableReservationCounts,
    });
  } catch (error) {
    console.error('Tables index error:', error);
    req.flash('error', 'Error loading tables');
    res.redirect('/dashboard');
  }
};

exports.create = (req, res) => {
  res.render('pages/tables/create', { title: 'Add Table' });
};

exports.store = async (req, res) => {
  try {
    const { table_number, capacity, location, status, description } = req.body;
    await Table.create({
      table_number,
      capacity: parseInt(capacity),
      location: location || 'indoor',
      status: status || 'available',
      description: description || null,
    });
    req.flash('success', `Table ${table_number} created successfully`);
    res.redirect('/tables');
  } catch (error) {
    console.error('Table store error:', error);
    req.flash('error', 'Error creating table: ' + error.message);
    res.redirect('/tables/create');
  }
};

exports.edit = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      req.flash('error', 'Table not found');
      return res.redirect('/tables');
    }
    res.render('pages/tables/edit', { title: `Edit Table ${table.table_number}`, table });
  } catch (error) {
    console.error('Table edit error:', error);
    req.flash('error', 'Error loading table');
    res.redirect('/tables');
  }
};

exports.update = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      req.flash('error', 'Table not found');
      return res.redirect('/tables');
    }

    const { table_number, capacity, location, status, is_active, description } = req.body;
    await table.update({
      table_number,
      capacity: parseInt(capacity),
      location,
      status,
      is_active: is_active === 'true' || is_active === '1',
      description: description || null,
    });

    req.flash('success', `Table ${table.table_number} updated successfully`);
    res.redirect('/tables');
  } catch (error) {
    console.error('Table update error:', error);
    req.flash('error', 'Error updating table: ' + error.message);
    res.redirect(`/tables/${req.params.id}/edit`);
  }
};

exports.destroy = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      req.flash('error', 'Table not found');
      return res.redirect('/tables');
    }

    // Check for active reservations
    const activeReservations = await Reservation.count({
      where: {
        table_id: table.id,
        reservation_date: { [Op.gte]: moment().format('YYYY-MM-DD') },
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
    });

    if (activeReservations > 0) {
      req.flash('error', `Cannot delete table ${table.table_number} - it has ${activeReservations} upcoming reservation(s)`);
      return res.redirect('/tables');
    }

    await table.destroy();
    req.flash('success', `Table ${table.table_number} deleted successfully`);
    res.redirect('/tables');
  } catch (error) {
    console.error('Table delete error:', error);
    req.flash('error', 'Error deleting table');
    res.redirect('/tables');
  }
};
