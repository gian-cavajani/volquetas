const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Cajas = db.define(
  'Cajas',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('ingreso', 'gasto'),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    moneda: DataTypes.ENUM('peso', 'dolar'),
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
    particularId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Particulares',
        key: 'id',
      },
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Empresas',
        key: 'id',
      },
    },
    ubicacionDelCliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Obras',
        key: 'id',
      },
    },
  },
  {
    timestamps: false,
    indexes: [{ fields: ['fecha'] }, { fields: ['tipo'] }, { fields: ['empleadoId'] }, { fields: ['particularId'] }, { fields: ['empresaId'] }],
  }
);

module.exports = Cajas;

//EJEMPLO:
// Cajas.create({
//   fecha: new Date(),
//   motivo: 'Pago de servicios',
//   tipo: 'gasto',
//   descripcion: 'Pago de electricidad',
//   moneda: 'peso',
//   monto: 100.0,
//   empleadoId: 1, // ID del empleado
//   particularId: null,
//   empresaId: 1, // ID de la empresa
//   ubicacionDelCliente: 1, // ID de la ubicación
// });
