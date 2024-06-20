const db = require('../config/db');
const Telefonos = require('./Telefonos');
const Empleados = require('./Empleados');
const Usuarios = require('./Usuarios');
const Camiones = require('./Camiones');
const Servicios = require('./Servicios');
const HistoricoUsoCamion = require('./HistoricoUsoCamion');
const Jornales = require('./Jornales');
const ClienteEmpresas = require('./ClienteEmpresas');
const ContactoEmpresas = require('./ContactoEmpresas');
const ClienteParticulares = require('./ClienteParticulares');
const Ubicaciones = require('./Ubicaciones');
const Permisos = require('./Permisos');
const Volquetas = require('./Volquetas');
const SeguimientoVolquetas = require('./SeguimientoVolquetas');
const Cajas = require('./Cajas');
const Pedidos = require('./Pedidos');

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

//ClienteEmpresas - ContactoEmpresas 1aN -->
ContactoEmpresas.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId', as: 'clienteEmpresa' });
ClienteEmpresas.hasMany(ContactoEmpresas, { foreignKey: 'clienteEmpresaId', as: 'contactos' });

//------------------UBICACIONES------------------//
//ClienteEmpresas - Ubicaciones 1aN --> Ubicaciones tiene clienteEmpresaId
Ubicaciones.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId', as: 'clienteEmpresa' });
ClienteEmpresas.hasMany(Ubicaciones, { foreignKey: 'clienteEmpresaId', as: 'ubicaciones' });

//ClienteParticulares - Ubicaciones 1aN --> Ubicaciones tiene clienteParticularId
Ubicaciones.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId', as: 'clienteParticular' });
ClienteParticulares.hasMany(Ubicaciones, { foreignKey: 'clienteParticularId', as: 'ubicaciones' });

//Ubicaciones - ContactoEmpresas 1aN --> ContactoEmpresa tiene ubicacionId
ContactoEmpresas.belongsTo(Ubicaciones, { foreignKey: 'ubicacionId', as: 'ubicacion' });
Ubicaciones.hasMany(ContactoEmpresas, { foreignKey: 'ubicacionId' });

//------------------PERMISOS------------------//
//ClienteEmpresas - Permisos 1aN --> Permisos tiene clienteEmpresaId
Permisos.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId' });
ClienteEmpresas.hasMany(Permisos, { foreignKey: 'clienteEmpresaId' });

//ClienteParticulares - Permisos 1aN --> Permisos tiene clienteParticularId
Permisos.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId' });
ClienteParticulares.hasMany(Permisos, { foreignKey: 'clienteParticularId' });

//Ubicaciones - Permisos 1aN --> Permisos tiene ubicacionId
Permisos.belongsTo(Ubicaciones, { foreignKey: 'ubicacionId' });
Ubicaciones.hasMany(Permisos, { foreignKey: 'ubicacionId' });

//------------------TELEFONOS------------------//
Telefonos.belongsTo(Empleados, { foreignKey: 'empleadoId', as: 'empleado' });
Empleados.hasMany(Telefonos, { foreignKey: 'empleadoId' });
Telefonos.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId', as: 'clienteParticular' });
ClienteParticulares.hasMany(Telefonos, { foreignKey: 'clienteParticularId' });
Telefonos.belongsTo(ContactoEmpresas, { foreignKey: 'contactoEmpresaId', as: 'contactoEmpresa' });
ContactoEmpresas.hasMany(Telefonos, { foreignKey: 'contactoEmpresaId' });

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
ClienteParticulares.hasMany(Cajas, { foreignKey: 'clienteParticularId' });
Cajas.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId' });

// Relación ClienteEmpresas - Cajas
ClienteEmpresas.hasMany(Cajas, { foreignKey: 'clienteEmpresaId' });
Cajas.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId' });

// Relación Ubicaciones - Cajas
Ubicaciones.hasMany(Cajas, { foreignKey: 'ubicacionDelCliente' });
Cajas.belongsTo(Ubicaciones, { foreignKey: 'ubicacionDelCliente' });

//------------------PEDIDOS------------------//
Pedidos.belongsTo(Usuarios, { foreignKey: 'usuarioId', as: 'creador' });
Pedidos.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId', as: 'clienteParticular' });
Pedidos.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId', as: 'clienteEmpresa' });
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
  ClienteEmpresas,
  ClienteParticulares,
  Ubicaciones,
  Permisos,
  Volquetas,
  SeguimientoVolquetas,
  Cajas,
  Pedidos,
};
