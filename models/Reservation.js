const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reservation_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  customer_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: { isEmail: true },
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  party_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 50 },
  },
  reservation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reservation_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'tables', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'pending',
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('walk_in', 'phone', 'online', 'admin'),
    defaultValue: 'admin',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'admins', key: 'id' },
  },
}, {
  tableName: 'reservations',
});

module.exports = Reservation;
