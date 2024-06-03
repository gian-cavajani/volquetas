const Sequelize = require('sequelize');
const os = require("os")
const hostname = os.hostname()
 
//si es la mac : user y pwd = '', si es win: user:postgres y pwd: Perro-2310
const user = hostname === "MRYQ9C2014" ? '' : 'postgres'
const pwd = hostname === "MRYQ9C2014" ? '' : 'Perro-2310'

module.exports = new Sequelize('volquetas', user, pwd, {
  host: '127.0.0.1',
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    }
  })