const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Movimientos = require('./Movimientos');
const Sugerencias = require('./Sugerencias');

const Pedidos = db.define(
  'Pedidos',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id',
      },
    },
    obraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Obras',
        key: 'id',
      },
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('iniciado', 'entregado', 'levantado', 'cancelado'),
      defaultValue: 'iniciado',
    },
    creadoComo: {
      type: DataTypes.ENUM('nuevo', 'recambio', 'multiple', 'entrega mas levante'),
      allowNull: false,
    },
    permisoId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Permisos',
        key: 'id',
      },
    },
    nroPesada: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pagoPedidoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'PagoPedidos',
        key: 'id',
      },
    },
    referenciaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Pedidos',
        key: 'id',
      },
    },
  },
  {
    getterMethods: {
      async getEntrega() {
        return await Movimientos.findOne({
          where: {
            pedidoId: this.id,
            tipo: 'entrega',
          },
        });
      },
      async getLevante() {
        return await Movimientos.findOne({
          where: {
            pedidoId: this.id,
            tipo: 'levante',
          },
        });
      },
      async getCountMovimientos() {
        return await Movimientos.count({ where: { pedidoId: this.id } });
      },
      async getSugerenciaEntrega() {
        return await Sugerencias.findOne({
          where: {
            pedidoId: this.id,
            tipoSugerido: 'entrega',
          },
        });
      },
      async getSugerenciaLevante() {
        return await Sugerencias.findOne({
          where: {
            pedidoId: this.id,
            tipoSugerido: 'levante',
          },
        });
      },
    },
  }
);

module.exports = Pedidos;
