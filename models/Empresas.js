const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Empresas = db.define(
  'Empresas',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    razonSocial: {
      type: DataTypes.STRING,
    },
    descripcion: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

module.exports = Empresas;
