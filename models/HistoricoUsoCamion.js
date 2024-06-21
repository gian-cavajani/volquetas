const { DataTypes } = require('sequelize');
const db = require('../config/db');

const HistoricoUsoCamion = db.define(
  'HistoricoUsoCamion',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
    camionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Camiones',
        key: 'id',
      },
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = HistoricoUsoCamion;
