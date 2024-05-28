const Sequelize = require('sequelize');
const db = require('../config/db');
const Telefonos = require('./Telefonos');

const Usuarios = db.define('Usuarios', {
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
    defaultValue: true,
  },
});

// Establecer la relación
Usuarios.hasMany(Telefonos, { foreignKey: 'userId' });
Telefonos.belongsTo(Usuarios, { foreignKey: 'userId' });

module.exports = Usuarios;
