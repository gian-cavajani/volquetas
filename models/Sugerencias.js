const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Sugerencias = db.define(
  'Sugerencias',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    horarioSugerido: DataTypes.DATE,
    choferSugeridoId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
    tipoSugerido: DataTypes.ENUM('entrega', 'levante'),
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pedidos',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Sugerencias;
