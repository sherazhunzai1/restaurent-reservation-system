const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RestaurantSettings = sequelize.define('RestaurantSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  default_reservation_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 90,
    comment: 'Default reservation duration in minutes',
  },
  max_party_size: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  min_advance_booking_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: 'Minimum hours in advance a reservation can be made',
  },
  max_advance_booking_days: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Maximum days in advance a reservation can be made',
  },
  time_slot_interval: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Time slot interval in minutes',
  },
  auto_confirm_reservations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allow_online_reservations: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  cancellation_policy: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'restaurant_settings',
});

module.exports = RestaurantSettings;
