const db = require('../config/db');
const Telefonos = require('./Telefonos');
const Empleados = require('./Empleados');
const Usuarios = require('./Usuarios');
const Camiones = require('./Camiones');
const Servicios = require('./Servicios');
const HistoricoUsoCamion = require('./HistoricoUsoCamion');
const Jornales = require('./Jornales');
const Empresas = require('./Empresas');
// const ContactoEmpresas = require('./ContactoEmpresas');
// const ClienteParticulares = require('./ClienteParticulares');
const Ubicaciones = require('./Ubicaciones');
const Permisos = require('./Permisos');
const Volquetas = require('./Volquetas');
const SeguimientoVolquetas = require('./SeguimientoVolquetas');
const Cajas = require('./Cajas');
const Pedidos = require('./Pedidos');
const Clientes = require('./Clientes');
const ClienteUbicaciones = require('./ClienteUbicaciones');

// --------- RELACIONES ---------

//Empleados - Usuarios 1a1 --> Usuario tiene empleadoId
Empleados.hasOne(Usuarios, { foreignKey: 'empleadoId' });
Usuarios.belongsTo(Empleados, { foreignKey: 'empleadoId' });

//Empleados - HistoricoUsoCamion NaN -> HistoricoUsoCamion tiene empleadoId
Empleados.hasMany(HistoricoUsoCamion, { foreignKey: 'empleadoId' });
HistoricoUsoCamion.belongsTo(Empleados, { foreignKey: 'empleadoId' });

//Camiones - HistoricoUsoCamion NaN -> HistoricoUsoCamion tiene empleadoId
Camiones.hasMany(HistoricoUsoCamion, { foreignKey: 'camionId' });
HistoricoUsoCamion.belongsTo(Camiones, { foreignKey: 'camionId' });

//Camion - Servicios 1aN --> Servicio tiene camionId
Camiones.hasMany(Servicios, { foreignKey: 'camionId' });
Servicios.belongsTo(Camiones, { foreignKey: 'camionId' });

//Empleados - Jornales 1aN --> Jornales tiene empleadoId
Empleados.hasMany(Jornales, { foreignKey: 'empleadoId' });
Jornales.belongsTo(Empleados, { foreignKey: 'empleadoId' });

//Empresas - Clientes 1aN -->
Clientes.belongsTo(Empresas, { foreignKey: 'empresaId', as: 'empresa' });
Empresas.hasMany(Clientes, { foreignKey: 'empresaId', as: 'contactos' });

//------------------UBICACIONES------------------//
//Empresas - Ubicaciones 1aN --> Ubicaciones tiene empresaId
Ubicaciones.belongsTo(Empresas, { foreignKey: 'empresaId', as: 'empresa' });
Empresas.hasMany(Ubicaciones, { foreignKey: 'empresaId', as: 'ubicaciones' });

// Relación de muchos a muchos
Clientes.belongsToMany(Ubicaciones, { through: ClienteUbicaciones });
Ubicaciones.belongsToMany(Clientes, { through: ClienteUbicaciones });

//------------------PERMISOS------------------//
//Ubicaciones - Permisos 1aN --> Permisos tiene ubicacionId
Permisos.belongsTo(Ubicaciones, { foreignKey: 'ubicacionId' });
Ubicaciones.hasMany(Permisos, { foreignKey: 'ubicacionId' });

//------------------TELEFONOS------------------//
Telefonos.belongsTo(Empleados, { foreignKey: 'empleadoId', as: 'empleado' });
Empleados.hasMany(Telefonos, { foreignKey: 'empleadoId' });
Telefonos.belongsTo(Clientes, { foreignKey: 'clienteId', as: 'cliente' });
Clientes.hasMany(Telefonos, { foreignKey: 'clienteId' });

//------------------VOLQUETAS------------------//
// Relación Volquetas - SeguimientoVolquetas
Volquetas.hasMany(SeguimientoVolquetas, { foreignKey: 'numeroVolqueta' });
SeguimientoVolquetas.belongsTo(Volquetas, { foreignKey: 'numeroVolqueta' });

// Relación Ubicaciones - SeguimientoVolquetas
Ubicaciones.hasMany(SeguimientoVolquetas, { foreignKey: 'ubicacionId' });
SeguimientoVolquetas.belongsTo(Ubicaciones, { foreignKey: 'ubicacionId' });

//------------------CAJAS------------------//
// Relación Empleados - Cajas
Empleados.hasMany(Cajas, { foreignKey: 'empleadoId' });
Cajas.belongsTo(Empleados, { foreignKey: 'empleadoId' });

// Relación ClienteParticular - Cajas
ClienteParticulares.hasMany(Cajas, { foreignKey: 'clienteId' });
Cajas.belongsTo(ClienteParticulares, { foreignKey: 'clienteId' });

// Relación Empresas - Cajas
Empresas.hasMany(Cajas, { foreignKey: 'empresaId' });
Cajas.belongsTo(Empresas, { foreignKey: 'empresaId' });

// Relación Ubicaciones - Cajas
Ubicaciones.hasMany(Cajas, { foreignKey: 'ubicacionDelCliente' });
Cajas.belongsTo(Ubicaciones, { foreignKey: 'ubicacionDelCliente' });

//------------------PEDIDOS------------------//
Pedidos.belongsTo(Usuarios, { foreignKey: 'usuarioId', as: 'creador' });
Pedidos.belongsTo(ClienteParticulares, { foreignKey: 'clienteId', as: 'cliente' });
Pedidos.belongsTo(Empresas, { foreignKey: 'empresaId', as: 'empresa' });
Pedidos.belongsTo(Ubicaciones, { foreignKey: 'ubicacionId', as: 'ubicacion' });
Pedidos.belongsTo(Empleados, { foreignKey: 'choferEntregaId', as: 'choferEntrega' });
Pedidos.belongsTo(Empleados, { foreignKey: 'choferLevanteId', as: 'choferLevante' });
Pedidos.belongsTo(Permisos, { foreignKey: 'permisoId', as: 'permiso' });
Pedidos.belongsTo(Volquetas, { foreignKey: 'volquetaId', as: 'volqueta' });
Pedidos.belongsTo(Pedidos, { foreignKey: 'referenciaId', as: 'referencia' });

module.exports = {
  db,
  Empleados,
  Usuarios,
  Telefonos,
  Camiones,
  HistoricoUsoCamion,
  Servicios,
  Jornales,
  ContactoEmpresas,
  Empresas,
  ClienteParticulares,
  Ubicaciones,
  Permisos,
  Volquetas,
  SeguimientoVolquetas,
  Cajas,
  Pedidos,
  Clientes,
  ClienteUbicaciones,
};
