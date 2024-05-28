const Sequelize = require('sequelize');
const db = require('../config/db');

const Telefonos = db.define('Telefonos', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  telefono: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Telefonos;
