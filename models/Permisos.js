const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Particulares = require('./Particulares');
const Empresas = require('./Empresas');
const Obras = require('./Obras');

const Permisos = db.define(
  'Permisos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Empresas,
        key: 'id',
      },
    },
    particularId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Particulares,
        key: 'id',
      },
    },
    numeroSolicitud: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Permisos;
