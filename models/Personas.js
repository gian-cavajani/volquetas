const { DataTypes } = require('sequelize');
const db = require('../config/db');

//TODO: PROBAR y preguntar a cliente si es que un contacto de una empresa puede llegar a ser un cliente particular.
const Personas = db.define(
  'Personas',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cedula: {
      type: DataTypes.STRING(8),
      unique: {
        args: true,
        msg: 'Ya hay una persona con esa cedula',
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    descripcion: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

module.exports = Personas;
