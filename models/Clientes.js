const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Ubicaciones, Empresas } = require('.');

const Clientes = db.define(
  'Clientes',
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
    tipo: {
      type: DataTypes.ENUM('empresa', 'particular'),
      allowNull: false,
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Empresas,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Clientes;
