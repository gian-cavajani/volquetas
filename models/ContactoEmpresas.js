const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Obras, Empresas } = require('.');

const ContactoEmpresas = db.define(
  'ContactoEmpresas',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Empresas,
        key: 'id',
      },
    },
    obraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Obras,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = ContactoEmpresas;
