const Sequelize = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

const user = process.env.DB_USER;
const pwd = process.env.DB_PWD;
const host = process.env.DB_HOST;
const name = process.env.DB_NAME;

module.exports = new Sequelize(name, user, pwd, {
  host: host,
  port: '5432',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
