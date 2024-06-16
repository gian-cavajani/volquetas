const { DataTypes } = require('sequelize');
const db = require('../config/db');

const SeguimientoVolquetas = db.define('SeguimientoVolquetas', {
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
      key: 'numero',
    },
  },
  ubicacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ubicaciones',
      key: 'id',
    },
  },
  otros: DataTypes.STRING, //guardaria el titulo del pedido / si esta arreglandose / si esta perdida / etc
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = SeguimientoVolquetas;
