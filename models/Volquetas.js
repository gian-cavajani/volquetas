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
      //estado podra ser cualquier cosa que le sirva a la empresa para tener mas info de la volqueta
      //ejemplo: 'sana', 'en arreglos', 'quemada', 'para pintar', 'etc'
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('grande', 'chica'),
      allowNull: false,
    },
    ocupada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Volquetas;
