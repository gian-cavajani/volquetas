const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Particulares = db.define(
  'Particulares',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cedula: {
      type: DataTypes.STRING(8),
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    descripcion: DataTypes.STRING,
  },
  {
    initialAutoIncrement: 10000,
    timestamps: false,
  }
);

module.exports = Particulares;
