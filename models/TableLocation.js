const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TableLocation = sequelize.define('TableLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'geo-alt',
    comment: 'Bootstrap icon name (without bi- prefix)',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'table_locations',
});

module.exports = TableLocation;
