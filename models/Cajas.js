const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Cajas = db.define(
  'Cajas',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.ENUM('vale', 'gasto', 'ingreso', 'ingreso pedido', 'ingreso cochera', 'extraccion'),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    moneda: {
      type: DataTypes.ENUM('peso', 'dolar'),
      allowNull: false,
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
    pedidoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Pedidos',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
    //indexes: [{ fields: ['fecha'] }, { fields: ['tipo'] }, { fields: ['empleadoId'] }, { fields: ['particularId'] }, { fields: ['empresaId'] }],
  }
);

module.exports = Cajas;
