const { DataTypes } = require('sequelize');
const db = require('../config/db');
const ClienteParticulares = require('./ClienteParticulares');
const ClienteEmpresas = require('./ClienteEmpresas');

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
    clienteParticularId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ClienteParticulares,
        key: 'id',
      },
    },
    clienteEmpresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ClienteEmpresas,
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Ubicaciones;
