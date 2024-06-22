const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Empresas, Clientes } = require('.');

const Ubicaciones = db.define(
  'Ubicaciones',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    calle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    esquina: {
      type: DataTypes.STRING,
    },
    barrio: {
      type: DataTypes.STRING,
    },
    coordenadas: {
      type: DataTypes.STRING,
    },
    numeroPuerta: {
      type: DataTypes.STRING,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    detalleResiduos: DataTypes.STRING,
    residuosMezclados: DataTypes.BOOLEAN,
    residuosReciclados: DataTypes.BOOLEAN,
    frecuenciaSemanal: DataTypes.INTEGER,
    destinoFinal: DataTypes.STRING,
    dias: DataTypes.STRING,
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Clientes,
        key: 'id',
      },
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

module.exports = Ubicaciones;
