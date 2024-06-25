const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Empresas, Particulares } = require('.');

const Obras = db.define(
  'Obras',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    calle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    esquina: {
      type: DataTypes.STRING,
    },
    barrio: {
      type: DataTypes.STRING,
    },
    coordenadas: {
      type: DataTypes.STRING,
    },
    numeroPuerta: {
      type: DataTypes.STRING,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    activa: { type: DataTypes.BOOLEAN, defaultValue: true },
    particularId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Particulares,
        key: 'id',
      },
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Empresas,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Obras;
