const Sequelize = require('sequelize');
const db = require('../config/db');

const Empleados = db.define('Empleados',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // camionId:{
      //   type: Sequelize.INTEGER
      // },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rol: {
        type: Sequelize.ENUM('admin', 'normal','chofer'),
        allowNull: false,
      },
      cedula:{
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: {
          args: true,
          msg: 'Ya hay un empleado con esa cedula',
        },
      },
      
})

module.exports = Empleados