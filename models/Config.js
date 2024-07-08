const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Obras, Empresas } = require('.');

const Config = db.define(
  'Config',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    anio: DataTypes.INTEGER,
    precioSinIva: DataTypes.FLOAT,
    precioConIva: DataTypes.FLOAT,
    horasDeTrabajo: DataTypes.INTEGER,
    configActiva: DataTypes.BOOLEAN,
  },
  {
    timestamps: false,
    hooks: {
      beforeCreate: (config) => {
        config.precioConIva = config.precioSinIva ? config.precioSinIva * 1.22 : null;
      },
      beforeUpdate: (config) => {
        config.precioConIva = config.precioSinIva ? config.precioSinIva * 1.22 : null;
      },
    },
  }
);

module.exports = Config;
