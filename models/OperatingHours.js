const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperatingHours = sequelize.define('OperatingHours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day_of_week: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 6 },
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday',
  },
  day_name: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  opening_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  closing_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  last_reservation_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Last time a reservation can be made',
  },
}, {
  tableName: 'operating_hours',
});

module.exports = OperatingHours;
