const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Movimientos = db.define(
  'Movimientos',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    numeroVolqueta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Volquetas',
        key: 'numeroVolqueta',
      },
    },
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pedidos',
        key: 'id',
      },
    },
    horario: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('entrega', 'levante'),
    },
    choferId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Movimientos;
