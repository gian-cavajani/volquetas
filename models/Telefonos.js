const Sequelize = require('sequelize');
const db = require('../config/db');

const Telefonos = db.define('Telefonos', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  telefono: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  extension: { type: Sequelize.STRING },
  tipo: {
    type: Sequelize.ENUM('telefono', 'celular'),
    allowNull: false,
  },
  empleadoId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Empleados',
      key: 'id',
    },
  },
  clienteParticularId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'ClienteParticulares',
      key: 'id',
    },
    contactoEmpresaId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ContactoEmpresas',
        key: 'id',
      },
    },
  },
});

module.exports = Telefonos;
