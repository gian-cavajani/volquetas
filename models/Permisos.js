const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Particulares = require('./Particulares');
const Empresas = require('./Empresas');
const Obras = require('./Obras');

const Permisos = db.define(
  'Permisos',
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'El numero del permiso debe ser unico',
      },
      primaryKey: true,
    },
    fechaCreacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATEONLY,
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
  },
  {
    timestamps: false,
  }
);

module.exports = Permisos;
