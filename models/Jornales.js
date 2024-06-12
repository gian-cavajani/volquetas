const { DataTypes } = require('sequelize');
const db = require('../config/db');
const moment = require('moment');

const Jornales = db.define(
  'Jornales',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empleadoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Empleados',
        key: 'id',
      },
    },
    tipo: {
      type: DataTypes.ENUM('trabajo', 'licencia', 'enfermedad', 'falta'),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    entrada: DataTypes.TIME,
    salida: DataTypes.TIME,
    horasExtra: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id',
      },
    },
  },
  {
    // Hooks de Sequelize para calcular horasExtra antes de guardar
    hooks: {
      beforeSave: (jornal, options) => {
        if (jornal.tipo === 'trabajo') {
          if (!jornal.entrada || !jornal.salida) {
            throw new Error('Por favor ingrese las horas de entrada y salida.');
          }
          const entrada = moment(jornal.entrada, 'HH:mm:ss');
          const salida = moment(jornal.salida, 'HH:mm:ss');
          const horas = salida.diff(entrada, 'hours', true);

          // Calcular las horas extra solo si se trabaja más de 8 horas
          const horasExtra = Math.max(horas - 8, 0);

          // Asignar el valor calculado de horasExtra a la columna en la base de datos
          jornal.horasExtra = horasExtra.toFixed(2);
        }
      },
    },
  }
);

module.exports = Jornales;
