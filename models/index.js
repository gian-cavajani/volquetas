const db = require('../config/db');
const Telefonos = require('./Telefonos');
const Empleados = require('./Empleados');
const Usuarios = require('./Usuarios');
const Camiones = require('./Camiones');
const Servicios = require('./Servicios');
const HistoricoUsoCamion = require('./HistoricoUsoCamion');
const Jornales = require('./Jornales');
const TelefonoPropietarios = require('./TelefonoPropietarios');
const ClienteEmpresas = require('./ClienteEmpresas');
const ContactoEmpresas = require('./ContactoEmpresas');
const ClienteParticulares = require('./ClienteParticulares');
const Ubicaciones = require('./Ubicaciones');
const Permisos = require('./Permisos');
const Volquetas = require('./Volquetas');
const SeguimientoVolquetas = require('./SeguimientoVolquetas');
const Cajas = require('./Cajas');

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
ContactoEmpresas.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId' });
ClienteEmpresas.hasMany(ContactoEmpresas, { foreignKey: 'clienteEmpresaId' });

//------------------UBICACIONES------------------//
//ClienteEmpresas - Ubicaciones 1aN --> Ubicaciones tiene clienteEmpresaId
Ubicaciones.belongsTo(ClienteEmpresas, { foreignKey: 'clienteEmpresaId' });
ClienteEmpresas.hasMany(Ubicaciones, { foreignKey: 'clienteEmpresaId' });

//ClienteParticulares - Ubicaciones 1aN --> Ubicaciones tiene clienteParticularId
Ubicaciones.belongsTo(ClienteParticulares, { foreignKey: 'clienteParticularId' });
ClienteParticulares.hasMany(Ubicaciones, { foreignKey: 'clienteParticularId' });

//Ubicaciones - ContactoEmpresas 1aN --> ContactoEmpresa tiene UbicacionDesignada
ContactoEmpresas.belongsTo(Ubicaciones, { foreignKey: 'UbicacionDesignada' });
Ubicaciones.hasMany(ContactoEmpresas, { foreignKey: 'UbicacionDesignada' });

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
//Telefonos tienen un telefonoPropietario pero telefonoPropietario puede tener muchos telefonos:
TelefonoPropietarios.belongsTo(Telefonos, { foreignKey: 'telefonoId' });
Telefonos.hasOne(TelefonoPropietarios, { foreignKey: 'telefonoId' });

TelefonoPropietarios.belongsTo(ContactoEmpresas, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'contactoEmpresas' } });
ContactoEmpresas.hasMany(TelefonoPropietarios, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'contactoEmpresas' } });

TelefonoPropietarios.belongsTo(Empleados, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'empleados' } });
Empleados.hasMany(TelefonoPropietarios, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'empleados' } });

TelefonoPropietarios.belongsTo(ClienteParticulares, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'clienteParticulares' } });
ClienteParticulares.hasMany(TelefonoPropietarios, { foreignKey: 'propietarioId', constraints: false, scope: { propietarioTipo: 'clienteParticulares' } });

//------------------VOLQUETAS------------------//
// Relación Volquetas - SeguimientoVolquetas
Volquetas.hasMany(SeguimientoVolquetas, { foreignKey: 'volquetaId' });
SeguimientoVolquetas.belongsTo(Volquetas, { foreignKey: 'volquetaId' });

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

module.exports = {
  db,
  Empleados,
  Usuarios,
  Telefonos,
  Camiones,
  HistoricoUsoCamion,
  Servicios,
  Jornales,
  TelefonoPropietarios,
  ContactoEmpresas,
  ClienteEmpresas,
  ClienteParticulares,
  Ubicaciones,
  Permisos,
  Volquetas,
  SeguimientoVolquetas,
  Cajas,
};
