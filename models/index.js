const sequelize = require('../config/database');
const Admin = require('./Admin');
const Table = require('./Table');
const Reservation = require('./Reservation');
const RestaurantSettings = require('./RestaurantSettings');
const OperatingHours = require('./OperatingHours');
const SpecialDate = require('./SpecialDate');

// Associations
Table.hasMany(Reservation, { foreignKey: 'table_id', as: 'reservations' });
Reservation.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

Admin.hasMany(Reservation, { foreignKey: 'created_by', as: 'reservations' });
Reservation.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  Admin,
  Table,
  Reservation,
  RestaurantSettings,
  OperatingHours,
  SpecialDate,
};
