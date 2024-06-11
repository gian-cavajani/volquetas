const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Telefonos = require('./Telefonos');

const TelefonoPropietarios = db.define('TelefonoPropietarios', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  propietarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  propietarioTipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefonoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Telefonos,
      key: 'id',
    },
  },
});

module.exports = TelefonoPropietarios;
