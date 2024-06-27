const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Volquetas = db.define(
  'Volquetas',
  {
    numeroVolqueta: {
      //numero es la PK
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('grande', 'chica'),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Volquetas;
