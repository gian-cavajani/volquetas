const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Obras } = require('.');

const ObraDetalles = db.define(
  'ObraDetalles',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    detalleResiduos: DataTypes.STRING,
    residuosMezclados: DataTypes.BOOLEAN,
    residuosReciclados: DataTypes.BOOLEAN,
    frecuenciaSemanal: DataTypes.RANGE(DataTypes.INTEGER),
    destinoFinal: DataTypes.STRING,
    dias: DataTypes.STRING,
    obraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Obras,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = ObraDetalles;
