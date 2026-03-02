const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecialDate = sequelize.define('SpecialDate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  is_closed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, restaurant is closed on this date',
  },
  special_opening_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  special_closing_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'special_dates',
});

module.exports = SpecialDate;
