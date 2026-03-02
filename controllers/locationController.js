const { TableLocation, Table } = require('../models');

exports.index = async (req, res) => {
  try {
    const locations = await TableLocation.findAll({
      include: [{ model: Table, as: 'tables', attributes: ['id'] }],
      order: [['name', 'ASC']],
    });
    res.render('pages/settings/locations', { title: 'Table Locations', locations });
  } catch (error) {
    console.error('Locations index error:', error);
    req.flash('error', 'Error loading locations');
    res.redirect('/admin/settings');
  }
};

exports.store = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      req.flash('error', 'Location name is required');
      return res.redirect('/admin/settings/locations');
    }
    await TableLocation.create({
      name: name.trim(),
      icon: icon || 'geo-alt',
    });
    req.flash('success', `Location "${name.trim()}" added successfully`);
    res.redirect('/admin/settings/locations');
  } catch (error) {
    console.error('Location store error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'A location with that name already exists');
    } else {
      req.flash('error', 'Error adding location: ' + error.message);
    }
    res.redirect('/admin/settings/locations');
  }
};

exports.update = async (req, res) => {
  try {
    const location = await TableLocation.findByPk(req.params.id);
    if (!location) {
      req.flash('error', 'Location not found');
      return res.redirect('/admin/settings/locations');
    }
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      req.flash('error', 'Location name is required');
      return res.redirect('/admin/settings/locations');
    }
    await location.update({
      name: name.trim(),
      icon: icon || 'geo-alt',
    });
    req.flash('success', `Location "${name.trim()}" updated successfully`);
    res.redirect('/admin/settings/locations');
  } catch (error) {
    console.error('Location update error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      req.flash('error', 'A location with that name already exists');
    } else {
      req.flash('error', 'Error updating location');
    }
    res.redirect('/admin/settings/locations');
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const location = await TableLocation.findByPk(req.params.id);
    if (!location) {
      req.flash('error', 'Location not found');
      return res.redirect('/admin/settings/locations');
    }
    await location.update({ is_active: !location.is_active });
    req.flash('success', `Location "${location.name}" ${location.is_active ? 'activated' : 'deactivated'}`);
    res.redirect('/admin/settings/locations');
  } catch (error) {
    console.error('Toggle location error:', error);
    req.flash('error', 'Error updating location status');
    res.redirect('/admin/settings/locations');
  }
};

exports.destroy = async (req, res) => {
  try {
    const location = await TableLocation.findByPk(req.params.id, {
      include: [{ model: Table, as: 'tables', attributes: ['id'] }],
    });
    if (!location) {
      req.flash('error', 'Location not found');
      return res.redirect('/admin/settings/locations');
    }
    if (location.tables && location.tables.length > 0) {
      req.flash('error', `Cannot delete "${location.name}" — it is assigned to ${location.tables.length} table(s). Reassign them first.`);
      return res.redirect('/admin/settings/locations');
    }
    const name = location.name;
    await location.destroy();
    req.flash('success', `Location "${name}" deleted successfully`);
    res.redirect('/admin/settings/locations');
  } catch (error) {
    console.error('Delete location error:', error);
    req.flash('error', 'Error deleting location');
    res.redirect('/admin/settings/locations');
  }
};
