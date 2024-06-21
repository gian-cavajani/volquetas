const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Servicios = db.define('Servicios', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  camionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Camiones',
      key: 'id',
    },
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('arreglo', 'service', 'chequeo', 'pintura'),
    allowNull: false,
  },
  precio: DataTypes.FLOAT,
  moneda: DataTypes.ENUM('peso', 'dolar'),
  descripcion: DataTypes.STRING,
});

module.exports = Servicios;
