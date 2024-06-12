const { DataTypes } = require('sequelize');
const db = require('../config/db');
const ClienteEmpresas = require('./ClienteEmpresas');
const Ubicaciones = require('./Ubicaciones');

const ContactoEmpresas = db.define('ContactoEmpresas', {
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
  UbicacionDesignada: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Ubicaciones,
      key: 'id',
    },
  },
});

module.exports = ContactoEmpresas;
