const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Pedidos = db.define('Pedidos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  },
  ubicacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ubicaciones',
      key: 'id',
    },
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('iniciado', 'entregado', 'levantado', 'pagado', 'cancelado'),
    defaultValue: 'iniciado',
  },
  choferEntregaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Empleados',
      key: 'id',
    },
  },
  choferLevanteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Empleados',
      key: 'id',
    },
  },
  horarioSugerido: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horarioEntregaReal: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horarioLevanteReal: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nroPesada: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pagado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  remito: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  volquetaNro: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Volquetas',
      key: 'numero',
    },
  },
  creadoComo: {
    type: DataTypes.ENUM('nuevo', 'recambio', 'multiple', 'entrega mas levante'),
    allowNull: false,
  },
  referenciaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Pedidos',
      key: 'id',
    },
  },
  nombrePedido: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Pedidos;
