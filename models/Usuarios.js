const Sequelize = require('sequelize');
const db = require('../config/db');
const Empleados = require('./Empleados');

const Usuarios = db.define('Usuarios', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  empleadoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Empleados,
      key: 'id',
    },
    unique: {
      args: true,
    },
    msg: 'Ya hay un usuario con ese empleado',
  },
  rol: {
    type: Sequelize.ENUM('admin', 'normal'),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Usuarios;
