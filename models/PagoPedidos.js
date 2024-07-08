const { DataTypes } = require('sequelize');
const db = require('../config/db');

const PagoPedidos = db.define(
  'PagoPedidos',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    pagado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    remito: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoPago: {
      type: DataTypes.ENUM('transferencia', 'efectivo', 'cheque'),
    },
  },
  {
    timestamps: false,
  }
);

module.exports = PagoPedidos;
