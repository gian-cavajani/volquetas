const { DataTypes } = require('sequelize');
const db = require('../config/db');

const SeguimientoVolquetas = db.define('SeguimientoVolquetas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  volquetaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Volquetas',
      key: 'id',
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
  otros: DataTypes.STRING,
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

module.exports = SeguimientoVolquetas;
