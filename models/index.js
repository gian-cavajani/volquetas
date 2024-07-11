const db = require('../config/db');
const Telefonos = require('./Telefonos');
const Empleados = require('./Empleados');
const Usuarios = require('./Usuarios');
const Camiones = require('./Camiones');
const Servicios = require('./Servicios');
const HistoricoUsoCamion = require('./HistoricoUsoCamion');
const Jornales = require('./Jornales');
const Empresas = require('./Empresas');
const ContactoEmpresas = require('./ContactoEmpresas');
const Particulares = require('./Particulares');
const Obras = require('./Obras');
const ObraDetalles = require('./ObraDetalles');
const Permisos = require('./Permisos');
const Volquetas = require('./Volquetas');
const Movimientos = require('./Movimientos');
const Sugerencias = require('./Sugerencias');
const Cajas = require('./Cajas');
const Pedidos = require('./Pedidos');
const PagoPedidos = require('./PagoPedidos');
const Personas = require('./Personas');
const Config = require('./Config');

// --------- RELACIONES ---------

//Personas - Empleados 1a1 --> Empleados tiene personaId
// Personas.hasOne(Empleados, { foreignKey: 'personaId' });
// Empleados.belongsTo(Personas, { foreignKey: 'personaId' });

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

//Empresas - ContactoEmpresas 1aN -->
ContactoEmpresas.belongsTo(Empresas, { foreignKey: 'empresaId', as: 'empresa' });
Empresas.hasMany(ContactoEmpresas, { foreignKey: 'empresaId', as: 'contactos' });

//------------------OBRAS------------------//
//Empresas - Obras 1aN --> Obras tiene empresaId
Obras.belongsTo(Empresas, { foreignKey: 'empresaId', as: 'empresa' });
Empresas.hasMany(Obras, { foreignKey: 'empresaId', as: 'obras' });

//Particulares - Obras 1aN --> Obras tiene particularId
Obras.belongsTo(Particulares, { foreignKey: 'particularId', as: 'particular' });
Particulares.hasMany(Obras, { foreignKey: 'particularId', as: 'obras' });

//Obras - ContactoEmpresas 1aN --> ContactoEmpresa tiene obraId
ContactoEmpresas.belongsTo(Obras, { foreignKey: 'obraId', as: 'obra' });
Obras.hasMany(ContactoEmpresas, { foreignKey: 'obraId', as: 'contactosDesignados' });

//Empleados - Usuarios 1a1 --> Usuario tiene empleadoId
Obras.hasOne(ObraDetalles, { foreignKey: 'obraId' });
ObraDetalles.belongsTo(Obras, { foreignKey: 'obraId' });

//------------------PERMISOS------------------//
//Empresas - Permisos 1aN --> Permisos tiene empresaId
Permisos.belongsTo(Empresas, { foreignKey: 'empresaId' });
Empresas.hasMany(Permisos, { foreignKey: 'empresaId' });

//Particulares - Permisos 1aN --> Permisos tiene particularId
Permisos.belongsTo(Particulares, { foreignKey: 'particularId' });
Particulares.hasMany(Permisos, { foreignKey: 'particularId' });

//------------------TELEFONOS------------------//
Telefonos.belongsTo(Empleados, { foreignKey: 'empleadoId', as: 'empleado' });
Empleados.hasMany(Telefonos, { foreignKey: 'empleadoId' });
Telefonos.belongsTo(Particulares, { foreignKey: 'particularId', as: 'particular' });
Particulares.hasMany(Telefonos, { foreignKey: 'particularId' });
Telefonos.belongsTo(ContactoEmpresas, { foreignKey: 'contactoEmpresaId', as: 'contactoEmpresa' });
ContactoEmpresas.hasMany(Telefonos, { foreignKey: 'contactoEmpresaId' });

//------------------VOLQUETAS------------------//
// Relación Volquetas - Movimientos
// Volquetas.hasMany(Movimientos, { foreignKey: 'numeroVolqueta' });
// Movimientos.belongsTo(Volquetas, { foreignKey: 'numeroVolqueta' });

// Relación Obras - Movimientos
// Obras.hasMany(Movimientos, { foreignKey: 'obraId' });
// Movimientos.belongsTo(Obras, { foreignKey: 'obraId' });

//------------------CAJAS------------------//
// Relación Empleados - Cajas
Empleados.hasMany(Cajas, { foreignKey: 'empleadoId' });
Cajas.belongsTo(Empleados, { foreignKey: 'empleadoId' });

// Relación ClienteParticular - Cajas
Particulares.hasMany(Cajas, { foreignKey: 'particularId' });
Cajas.belongsTo(Particulares, { foreignKey: 'particularId' });

// Relación Empresas - Cajas
Empresas.hasMany(Cajas, { foreignKey: 'empresaId' });
Cajas.belongsTo(Empresas, { foreignKey: 'empresaId' });

// Relación Obras - Cajas
Obras.hasMany(Cajas, { foreignKey: 'obraDelCliente' });
Cajas.belongsTo(Obras, { foreignKey: 'obraDelCliente' });

//------------------MOVIMIENTOS------------------//
Movimientos.belongsTo(Volquetas, { foreignKey: 'numeroVolqueta' });
Movimientos.belongsTo(Pedidos, { foreignKey: 'pedidoId' });
Movimientos.belongsTo(Empleados, { foreignKey: 'choferId' });

//------------------PEDIDOS------------------//
Pedidos.belongsTo(Usuarios, { foreignKey: 'creadoPor' });
Pedidos.belongsTo(Obras, { foreignKey: 'obraId' });
Pedidos.belongsTo(Permisos, { foreignKey: 'permisoId' });
Pedidos.hasMany(Movimientos, { foreignKey: 'pedidoId' });
Pedidos.hasMany(Sugerencias, { foreignKey: 'pedidoId' });
Obras.hasMany(Pedidos, { foreignKey: 'obraId' });

//Pago-Pedidos 1an -> pagoPedidos puede tener multiples pedidos (en caso multiple todos los pedidos tienen el mismo pago pedido)
PagoPedidos.hasMany(Pedidos, { foreignKey: 'pagoPedidoId', as: 'pedidos' });
Pedidos.belongsTo(PagoPedidos, { foreignKey: 'pagoPedidoId', as: 'pagoPedido' });
//------------------SUGERENCIAS------------------//
Sugerencias.belongsTo(Empleados, { foreignKey: 'choferSugeridoId' });
Sugerencias.belongsTo(Pedidos, { foreignKey: 'pedidoId' });

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
  Particulares,
  Obras,
  Permisos,
  Volquetas,
  Cajas,
  Pedidos,
  PagoPedidos,
  Movimientos,
  Sugerencias,
  ObraDetalles,
  Personas,
  Config,
};
