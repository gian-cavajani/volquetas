const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Facturas = db.define('Facturas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.ENUM('credito', 'contado', 'recibo'),
    allowNull: false,
  },
  numeracion: {
    type: DataTypes.STRING,
    unique: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagada', 'anulada'),
    allowNull: false,
  },
  fechaPago: {
    type: DataTypes.DATEONLY,
  },
  monto: {
    type: DataTypes.FLOAT,
  },
  descripcion: {
    type: DataTypes.STRING,
  },
  particularId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Particulares',
      key: 'id',
    },
  },
  empresaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Empresas',
      key: 'id',
    },
  },
});

module.exports = Facturas;
