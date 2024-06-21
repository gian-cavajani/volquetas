const { DataTypes } = require('sequelize');
const db = require('../config/db');
const ClienteParticulares = require('./ClienteParticulares');
const ClienteEmpresas = require('./ClienteEmpresas');
const Ubicaciones = require('./Ubicaciones');

const Permisos = db.define(
  'Permisos',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        const fechaEntrega = this.getDataValue('fechaEntrega');
        return fechaEntrega ? moment(fechaEntrega).add(3, 'months').toDate() : null;
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
    clienteParticularId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ClienteParticulares,
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
    numeroSolicitud: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Permisos;
