const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Volquetas = db.define('Volquetas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('grande', 'chica'),
    allowNull: false,
  },
});

module.exports = Volquetas;
