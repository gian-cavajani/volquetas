const Sequelize = require('sequelize');
const db = require('../config/db');
const { Personas } = require('.');

const Empleados = db.define(
  'Empleados',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    rol: {
      type: Sequelize.ENUM('admin', 'normal', 'chofer'),
      allowNull: false,
    },
    cedula: {
      type: Sequelize.STRING(8),
      allowNull: false,
      unique: {
        args: true,
        msg: 'Ya hay un empleado con esa cedula',
      },
    },
    habilitado: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    fechaEntrada: {
      type: Sequelize.DATEONLY,
    },
    fechaSalida: {
      type: Sequelize.DATEONLY,
      defaultValue: null,
    },
    direccion: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);

module.exports = Empleados;
