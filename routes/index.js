const express = require('express');
const router = express.Router();

//Middleware
const { validarId, validarFechaParams, verificarToken, validarBodyVacioYSanitizar } = require('../middleware/validaciones');

//Controllers:
const usuarioController = require('../controllers/usuarioController');
const camionController = require('../controllers/camionController');
const empleadoController = require('../controllers/empleadoController');
const telefonoController = require('../controllers/telefonoController');
const historicoController = require('../controllers/historicoController');
const servicioController = require('../controllers/servicioController');
const jornalController = require('../controllers/jornalController');
const empresaController = require('../controllers/empresaController');
const contactoEmpresaController = require('../controllers/contactoEmpresaController');
const obrasController = require('../controllers/obrasController');
const particularController = require('../controllers/particularController');
const permisoController = require('../controllers/permisoController');
const volquetaController = require('../controllers/volquetaController');
const pedidoController = require('../controllers/pedidoController');
const movimientoController = require('../controllers/movimientoController');
const configController = require('../controllers/configController');
const pagoController = require('../controllers/pagoController');
const sugerenciaController = require('../controllers/sugerenciaController');

module.exports = function () {
  //healthcheck
  router.get('/', (req, res) => {
    res.json(`Servidor corriendo en el puerto ${process.env.PORT}`);
  });

  //Usuarios
  router.post('/usuarios', validarBodyVacioYSanitizar, usuarioController.nuevoUsuario);
  router.get('/usuarios', verificarToken(true), usuarioController.getUsuarios);
  router.post('/usuarios/login', validarBodyVacioYSanitizar, usuarioController.loginUsuario);
  router.post('/usuarios/confirmar', validarBodyVacioYSanitizar, verificarToken(true), usuarioController.confirmarUsuario);
  router.get('/usuarios/inactivos', verificarToken(true), usuarioController.getUsuariosInactivos);
  router.get('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.getUsuario);
  router.put('/usuarios/:usuarioId', validarBodyVacioYSanitizar, validarId('usuarioId'), verificarToken(true), usuarioController.modificarUsuario);
  router.delete('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.borrarUsuario);

  //Camiones
  router.post('/camiones', validarBodyVacioYSanitizar, verificarToken(), camionController.nuevoCamion);
  router.get('/camiones', verificarToken(), camionController.getCamiones);
  router.get('/camiones/:camionId', verificarToken(), validarId('camionId'), camionController.getCamion);
  router.put('/camiones/:camionId', validarBodyVacioYSanitizar, verificarToken(), validarId('camionId'), camionController.actualizarCamion);
  router.delete('/camiones/:camionId', verificarToken(true), validarId('camionId'), camionController.borrarCamion);

  //Empleados
  router.post('/empleados', validarBodyVacioYSanitizar, verificarToken(), empleadoController.nuevoEmpleado);
  router.get('/empleados', verificarToken(), empleadoController.getEmpleados);
  router.get('/empleados/sin-usuario-activos', empleadoController.getEmpleadosActivosYSinUsuario);
  router.get('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.getEmpleado);
  router.patch('/empleados/:empleadoId/estado', verificarToken(true), validarId('empleadoId'), empleadoController.cambiarEstadoEmpleado);
  router.put('/empleados/:empleadoId', validarBodyVacioYSanitizar, verificarToken(), validarId('empleadoId'), empleadoController.modificarEmpleado);
  router.delete('/empleados/:empleadoId', verificarToken(true), validarId('empleadoId'), empleadoController.eliminarEmpleado);

  //Telefonos:
  router.post('/telefonos', validarBodyVacioYSanitizar, verificarToken(), telefonoController.nuevoTelefono);
  router.get('/telefonos/:telefonoId', verificarToken(), validarId('telefonoId'), telefonoController.getTelefono);
  router.get('/telefonos', verificarToken(), telefonoController.getAllTelefonos);
  router.put('/telefonos/:telefonoId', validarBodyVacioYSanitizar, verificarToken(), validarId('telefonoId'), telefonoController.updateTelefono);

  //Historico uso camion
  router.post('/historico-camion', validarBodyVacioYSanitizar, verificarToken(), historicoController.registrarUsoCamion);
  router.get('/historico-camion/asignacion', verificarToken(), historicoController.obtenerAsignacionesActuales);
  router.get('/historico-camion', verificarToken(), historicoController.obtenerHistoricoPorCamionOEmpleado);

  //Servicios
  router.post('/servicios', validarBodyVacioYSanitizar, verificarToken(), servicioController.nuevoServicio);
  router.get('/servicios', verificarToken(), servicioController.getServicios);
  router.get('/servicios/mensuales', verificarToken(), servicioController.getServiciosPorCamionMensual);
  router.get('/servicios/:camionId', verificarToken(), validarId('camionId'), servicioController.getServicioPorCamion);
  router.delete('/servicios/:servicioId', verificarToken(true), validarId('servicioId'), servicioController.deleteServicio);

  //Jornales
  router.post('/jornales', validarBodyVacioYSanitizar, verificarToken(), jornalController.nuevoJornal);
  router.get('/jornales/:jornalId', verificarToken(), validarId('jornalId'), jornalController.getJornal);
  router.delete('/jornales/:jornalId', verificarToken(true), validarId('jornalId'), jornalController.borrarJornal);
  router.put('/jornales/:jornalId', validarBodyVacioYSanitizar, verificarToken(true), validarId('jornalId'), jornalController.editarJornal);
  router.get('/jornales/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getJornalesPorEmpleado);

  //Datos de Jornales
  router.get('/datos/todos/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getAllDatosPorPeriodo);
  router.get('/datos/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getDatosPorEmpleado);

  // Empresas
  router.post('/empresas', validarBodyVacioYSanitizar, verificarToken(), empresaController.createEmpresa);
  router.get('/empresas', verificarToken(), empresaController.getAllEmpresas);
  router.get('/empresas/buscar', verificarToken(), empresaController.buscarEmpresa);
  router.get('/empresas/:empresaId', verificarToken(), validarId('empresaId'), empresaController.getEmpresa);
  router.put('/empresas/:empresaId', validarBodyVacioYSanitizar, verificarToken(), validarId('empresaId'), empresaController.updateEmpresa);
  router.delete('/empresas/:empresaId', verificarToken(true), validarId('empresaId'), empresaController.deleteEmpresa);

  // ContactoEmpresas
  router.post('/contacto-empresas', validarBodyVacioYSanitizar, verificarToken(), contactoEmpresaController.createContactoEmpresa);
  router.get('/contacto-empresas', verificarToken(), contactoEmpresaController.getAllContactoEmpresas);
  router.get('/contacto-empresas/:contactoEmpresaId', verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.getContactoEmpresa);
  router.put('/contacto-empresas/:contactoEmpresaId', validarBodyVacioYSanitizar, verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.updateContactoEmpresa);
  router.put('/contacto-empresas/asignar/:contactoEmpresaId', validarBodyVacioYSanitizar, verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.asignarObra);
  router.delete('/contacto-empresas/:contactoEmpresaId', verificarToken(true), validarId('contactoEmpresaId'), contactoEmpresaController.deleteContactoEmpresa);

  // Particulares
  router.post('/particulares', validarBodyVacioYSanitizar, verificarToken(), particularController.createParticular);
  router.get('/particulares', verificarToken(), particularController.getAllParticulares);
  router.get('/particulares/buscar', verificarToken(), particularController.buscarParticular);
  router.get('/particulares/:particularId', verificarToken(), validarId('particularId'), particularController.getParticular);
  router.put('/particulares/:particularId', validarBodyVacioYSanitizar, verificarToken(), validarId('particularId'), particularController.updateParticular);
  router.delete('/particulares/:particularId', verificarToken(true), validarId('particularId'), particularController.deleteParticular);

  // Obras
  router.post('/obras', validarBodyVacioYSanitizar, verificarToken(), obrasController.createObra);
  router.get('/obras', verificarToken(), obrasController.getAllObras);
  router.get('/obras/:obraId', verificarToken(), validarId('obraId'), obrasController.getObra);
  router.put('/obras/:obraId', validarBodyVacioYSanitizar, verificarToken(), validarId('obraId'), obrasController.updateObra);
  router.put('/obras-detalle/:obraId', validarBodyVacioYSanitizar, verificarToken(), validarId('obraId'), obrasController.updateObraDetalles);
  router.delete('/obras/:obraId', verificarToken(true), validarId('obraId'), obrasController.deleteObra);

  //Permisos
  router.post('/permisos', verificarToken(), validarBodyVacioYSanitizar, permisoController.crearPermiso);
  router.get('/permisos', verificarToken(), permisoController.obtenerPermisos);
  router.get('/permisos/empresa/:empresaId', verificarToken(), validarId('empresaId'), permisoController.obtenerPermisosPorEmpresa);
  router.get('/permisos/particular/:particularId', verificarToken(), validarId('particularId'), permisoController.obtenerPermisosPorParticular);
  router.put('/permisos/:permisoId', verificarToken(), validarBodyVacioYSanitizar, validarId('permisoId'), permisoController.actualizarPermiso);
  router.delete('/permisos/:permisoId', verificarToken(true), validarId('permisoId'), permisoController.eliminarPermiso);

  //Volquetas
  router.post('/volquetas', verificarToken(), validarBodyVacioYSanitizar, volquetaController.createVolqueta);
  router.get('/volquetas', verificarToken(), volquetaController.getAllVolquetas);
  router.get('/volquetas/:numeroVolqueta', verificarToken(), validarId('numeroVolqueta'), volquetaController.getVolquetaById);
  router.put('/volquetas/:numeroVolqueta', verificarToken(), validarBodyVacioYSanitizar, validarId('numeroVolqueta'), volquetaController.updateVolquetaById);
  router.delete('/volquetas/:numeroVolqueta', verificarToken(true), validarId('numeroVolqueta'), volquetaController.deleteVolquetaById);

  //Pedidos
  router.post('/pedidos/multiple', verificarToken(), validarBodyVacioYSanitizar, pedidoController.createPedidoMultiple);
  router.post('/pedidos/nuevo', verificarToken(), validarBodyVacioYSanitizar, pedidoController.createPedidoNuevo);
  router.post('/pedidos/entrega-levante', verificarToken(), validarBodyVacioYSanitizar, pedidoController.createPedidoNuevo);
  router.post('/pedidos/recambio', verificarToken(), validarBodyVacioYSanitizar, pedidoController.createPedidoNuevo);
  router.get('/pedidos', verificarToken(), pedidoController.getPedidos);
  router.get('/pedidos-filtro', verificarToken(), pedidoController.getPedidosConFiltro);
  router.get('/pedidos/:pedidoId', verificarToken(), validarId('pedidoId'), pedidoController.getPedidoId);
  router.put('/pedidos/:pedidoId', verificarToken(), validarBodyVacioYSanitizar, validarId('pedidoId'), pedidoController.modificarPedido);
  router.delete('/pedidos/:pedidoId', verificarToken(), validarBodyVacioYSanitizar, validarId('pedidoId'), pedidoController.eliminarPedido);

  //Movimientos (Entrega/Levante)
  router.post('/movimientos', verificarToken(), validarBodyVacioYSanitizar, movimientoController.nuevoMovimiento);
  router.put('/movimientos/:movimientoId', verificarToken(), validarId('movimientoId'), validarBodyVacioYSanitizar, movimientoController.modificarMovimiento);
  router.get('/movimientos', verificarToken(), movimientoController.getMovimientos);
  router.delete('/movimientos/:movimientoId', verificarToken(), validarId('movimientoId'), movimientoController.eliminarMovimiento);
  router.get('/movimientos-chofer/:choferId', verificarToken(), validarId('choferId'), movimientoController.countMovimientosPorChofer);

  //Sugerencias
  router.post('/sugerencias', verificarToken(), validarBodyVacioYSanitizar, sugerenciaController.createSugerencia);
  router.put('/sugerencias/:sugerenciaId', verificarToken(), validarId('sugerenciaId'), validarBodyVacioYSanitizar, sugerenciaController.updateSugerencia);
  router.delete('/sugerencias/:sugerenciaId', verificarToken(), validarId('sugerenciaId'), sugerenciaController.deleteSugerencia);

  //Pagos - Pedido
  router.put('/pago-pedidos/:pagoPedidoId', verificarToken(), validarBodyVacioYSanitizar, validarId('pagoPedidoId'), pagoController.modificarPago);

  //Config
  router.post('/config', verificarToken(true), validarBodyVacioYSanitizar, configController.createConfig);
  router.get('/config', verificarToken(true), configController.getConfigs);
  router.get('/config-activa', verificarToken(true), configController.getConfigActiva);
  router.get('/config/:configId', verificarToken(true), validarId('configId'), configController.getConfigId);
  router.put('/config/:configId', verificarToken(true), validarBodyVacioYSanitizar, configController.updateConfig);

  return router;
};
