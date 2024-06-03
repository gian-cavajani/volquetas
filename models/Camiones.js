const Sequelize = require('sequelize');
const db = require('../config/db');

const Camiones = db.define('Camiones',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      matricula: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: 'Matricula ya existe',
        },
        validate:{
          notEmpty:{
            msg: 'La Matricula no puede estar vacia'
          }
        }
      },
      modelo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El Modelo no puede estar vacio',
          },
        },
      },
      anio: {
        type: Sequelize.INTEGER,
      },
      estado: {
        type: Sequelize.STRING,
      }      
})

module.exports = Camiones;