const express = require('express');
const router = express.Router();

//Middleware
const { validarId, validarFechaParams, verificarToken } = require('../middleware/validaciones');

//Controllers:
const usuarioController = require('../controllers/usuarioController');
const camionController = require('../controllers/camionController');
const empleadoController = require('../controllers/empleadoController');
const telefonoController = require('../controllers/telefonoController');
const historicoController = require('../controllers/historicoController');
const servicioController = require('../controllers/servicioController');
const jornalController = require('../controllers/jornalController');
const clienteEmpresaController = require('../controllers/clienteEmpresaController');
const contactoEmpresaController = require('../controllers/contactoEmpresaController');
const ubicacionesController = require('../controllers/ubicacionesController');

module.exports = function () {
  //healthcheck
  router.get('/', (req, res) => {
    res.json(`Servidor corriendo en el puerto ${process.env.PORT}`);
  });

  //Usuarios
  router.post('/usuarios', usuarioController.nuevoUsuario);
  router.get('/usuarios', verificarToken(true), usuarioController.getUsuarios);
  router.post('/usuarios/login', usuarioController.loginUsuario);
  router.post('/usuarios/confirmar', verificarToken(true), usuarioController.confirmarUsuario);
  router.get('/usuarios/inactivos', verificarToken(true), usuarioController.getUsuariosInactivos);
  router.get('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.getUsuario);
  router.put('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.modificarUsuario);
  router.delete('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.borrarUsuario);

  //Camiones
  router.post('/camiones', verificarToken(), camionController.nuevoCamion);
  router.get('/camiones', verificarToken(), camionController.getCamiones);
  router.get('/camiones/:camionId', verificarToken(), validarId('camionId'), camionController.getCamion);
  router.put('/camiones/:camionId', verificarToken(), validarId('camionId'), camionController.actualizarCamion);
  router.delete('/camiones/:camionId', verificarToken(true), validarId('camionId'), camionController.borrarCamion);

  //Empleados
  router.post('/empleados', verificarToken(), empleadoController.nuevoEmpleado);
  router.get('/empleados', verificarToken(), empleadoController.getEmpleados);
  router.get('/empleados/sin-usuario-activos', empleadoController.getEmpleadosActivosYSinUsuario);
  router.get('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.getEmpleado);
  router.patch('/empleados/:empleadoId/estado', verificarToken(true), validarId('empleadoId'), empleadoController.cambiarEstadoEmpleado);
  router.put('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.modificarEmpleado);
  router.delete('/empleados/:empleadoId', verificarToken(true), validarId('empleadoId'), empleadoController.eliminarEmpleado);

  //Telefonos:
  router.post('/telefonos', verificarToken(), telefonoController.nuevoTelefono);
  router.get('/telefonos/:telefonoId', verificarToken(), validarId('telefonoId'), telefonoController.getTelefono);
  router.get('/telefonos', verificarToken(), telefonoController.getAllTelefonos);
  router.put('/telefonos/:telefonoId', verificarToken(), validarId('telefonoId'), telefonoController.updateTelefono);

  //Historico uso camion
  router.post('/historico-camion', verificarToken(), historicoController.registrarUsoCamion);
  router.get('/historico-camion/asignacion', verificarToken(), historicoController.obtenerAsignacionesActuales);
  router.get('/historico-camion', verificarToken(), historicoController.obtenerHistoricoPorCamionOEmpleado);

  //Servicios
  router.post('/servicios', verificarToken(), servicioController.nuevoServicio);
  router.get('/servicios', verificarToken(), servicioController.getServicios);
  router.get('/servicios/:camionId', verificarToken(), validarId('camionId'), servicioController.getServicioPorCamion);

  //Jornales
  router.post('/jornales', verificarToken(), jornalController.nuevoJornal);
  router.get('/jornales/:jornalId', verificarToken(), validarId('jornalId'), jornalController.getJornal);
  router.delete('/jornales/:jornalId', verificarToken(true), validarId('jornalId'), jornalController.borrarJornal);
  router.put('/jornales/:jornalId', verificarToken(true), validarId('jornalId'), jornalController.editarJornal);

  //router.get('/jornales/horas/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getHorasPorEmpleado);
  router.get('/jornales/todos/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getAllJornalesPorPeriodo);
  router.get('/jornales/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getJornalesPorEmpleado);

  // ClienteEmpresas
  router.post('/cliente-empresas', verificarToken(), clienteEmpresaController.createClienteEmpresa);
  router.get('/cliente-empresas', verificarToken(), clienteEmpresaController.getAllClienteEmpresas);
  router.get('/cliente-empresas/:clienteEmpresaId', verificarToken(), validarId('clienteEmpresaId'), clienteEmpresaController.getClienteEmpresa);
  router.put('/cliente-empresas/:clienteEmpresaId', verificarToken(), validarId('clienteEmpresaId'), clienteEmpresaController.updateClienteEmpresa);
  router.delete('/cliente-empresas/:clienteEmpresaId', verificarToken(true), validarId('clienteEmpresaId'), clienteEmpresaController.deleteClienteEmpresa);

  // ContactoEmpresas
  router.post('/contacto-empresas', verificarToken(), contactoEmpresaController.createContactoEmpresa);
  router.get('/contacto-empresas', verificarToken(), contactoEmpresaController.getAllContactoEmpresas);
  router.get('/contacto-empresas/:contactoEmpresaId', verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.getContactoEmpresa);
  router.put('/contacto-empresas/:contactoEmpresaId', verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.updateContactoEmpresa);
  router.put('/contacto-empresas/asignar/:contactoEmpresaId', verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.asignarUbicacion);
  router.delete('/contacto-empresas/:contactoEmpresaId', verificarToken(true), validarId('contactoEmpresaId'), contactoEmpresaController.deleteContactoEmpresa);

  // Ubicaciones
  router.post('/ubicaciones', verificarToken(), ubicacionesController.createUbicacion);
  router.get('/ubicaciones', verificarToken(), ubicacionesController.getAllUbicaciones);
  router.get('/ubicaciones/:ubicacionId', verificarToken(), validarId('ubicacionId'), ubicacionesController.getUbicacion);
  router.put('/ubicaciones/:ubicacionId', verificarToken(), validarId('ubicacionId'), ubicacionesController.updateUbicacion);
  router.delete('/ubicaciones/:ubicacionId', verificarToken(true), validarId('ubicacionId'), ubicacionesController.deleteUbicacion);

  return router;
};
