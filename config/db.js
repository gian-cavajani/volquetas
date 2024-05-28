const Sequelize = require('sequelize');

module.exports = new Sequelize('volquetas', 'postgres', 'Perro-2310', {
  host: '127.0.0.1',
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // ---------- elimina las columnas por default (createdAy,updatedAt) -----------
  // define:{
  //   timestamps:false
  // }

  //logging:false   -> deshabilita el logging
});
