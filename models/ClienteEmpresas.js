const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ClienteEmpresas = db.define('ClienteEmpresas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rut: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: DataTypes.STRING,
});

module.exports = ClienteEmpresas;
