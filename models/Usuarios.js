const Sequelize = require('sequelize');
const db = require('../config/db');

const Usuarios = db.define('Usuarios', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  empleadoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
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
    allowNull: false,
    unique: true,
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
