const { DataTypes } = require('sequelize');
const db = require('../config/db');

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
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    entrada: DataTypes.TIME,
    salida: DataTypes.TIME,
    horasExtra: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    usuarioId: {
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
        if (!jornal.entrada || !jornal.salida) {
          throw new Error('Por favor ingrese las horas de entrada y salida.');
        }
        const entrada = new Date(`2022-01-01T${jornal.entrada}`);
        const salida = new Date(`2022-01-01T${jornal.salida}`);

        let diff = salida - entrada;
        const horas = Math.floor(diff / (1000 * 60 * 60));
        diff -= horas * 1000 * 60 * 60;
        const minutos = Math.floor(diff / (1000 * 60));

        let horasExtra = horas - 8;
        if (minutos >= 30) {
          horasExtra += 0.5;
        }

        // Asignar el valor calculado de horasExtra a la columna en la base de datos
        jornal.horasExtra = Math.max(horasExtra, 0);
      },
    },
  }
);

module.exports = Jornales;
