const { DataTypes } = require('sequelize');
const db = require('../config/db');
const ClienteEmpresas = require('./ClienteEmpresas');
const Ubicaciones = require('./Ubicaciones');

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
    cedula: {
      type: DataTypes.STRING(8),
      unique: true,
      allowNull: true,
    },
    descripcion: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    clienteEmpresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ClienteEmpresas,
        key: 'id',
      },
    },
    ubicacionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Ubicaciones,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = ContactoEmpresas;
