const { DataTypes } = require('sequelize');
const db = require('../config/db');
const { Empresas, Clientes } = require('.');

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
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Empresas,
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
