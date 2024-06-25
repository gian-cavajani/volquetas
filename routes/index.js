const express = require('express');
const router = express.Router();

//Middleware
const { validarId, validarFechaParams, verificarToken, validarBodyVacio } = require('../middleware/validaciones');

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

module.exports = function () {
  //healthcheck
  router.get('/', (req, res) => {
    res.json(`Servidor corriendo en el puerto ${process.env.PORT}`);
  });

  //Usuarios
  router.post('/usuarios', validarBodyVacio, usuarioController.nuevoUsuario);
  router.get('/usuarios', verificarToken(true), usuarioController.getUsuarios);
  router.post('/usuarios/login', validarBodyVacio, usuarioController.loginUsuario);
  router.post('/usuarios/confirmar', validarBodyVacio, verificarToken(true), usuarioController.confirmarUsuario);
  router.get('/usuarios/inactivos', verificarToken(true), usuarioController.getUsuariosInactivos);
  router.get('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.getUsuario);
  router.put('/usuarios/:usuarioId', validarBodyVacio, validarId('usuarioId'), verificarToken(true), usuarioController.modificarUsuario);
  router.delete('/usuarios/:usuarioId', validarId('usuarioId'), verificarToken(true), usuarioController.borrarUsuario);

  //Camiones
  router.post('/camiones', validarBodyVacio, verificarToken(), camionController.nuevoCamion);
  router.get('/camiones', verificarToken(), camionController.getCamiones);
  router.get('/camiones/:camionId', verificarToken(), validarId('camionId'), camionController.getCamion);
  router.put('/camiones/:camionId', validarBodyVacio, verificarToken(), validarId('camionId'), camionController.actualizarCamion);
  router.delete('/camiones/:camionId', verificarToken(true), validarId('camionId'), camionController.borrarCamion);

  //Empleados
  router.post('/empleados', validarBodyVacio, verificarToken(), empleadoController.nuevoEmpleado);
  router.get('/empleados', verificarToken(), empleadoController.getEmpleados);
  router.get('/empleados/sin-usuario-activos', empleadoController.getEmpleadosActivosYSinUsuario);
  router.get('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.getEmpleado);
  router.patch('/empleados/:empleadoId/estado', verificarToken(true), validarId('empleadoId'), empleadoController.cambiarEstadoEmpleado);
  router.put('/empleados/:empleadoId', validarBodyVacio, verificarToken(), validarId('empleadoId'), empleadoController.modificarEmpleado);
  router.delete('/empleados/:empleadoId', verificarToken(true), validarId('empleadoId'), empleadoController.eliminarEmpleado);

  //Telefonos:
  router.post('/telefonos', validarBodyVacio, verificarToken(), telefonoController.nuevoTelefono);
  router.get('/telefonos/:telefonoId', verificarToken(), validarId('telefonoId'), telefonoController.getTelefono);
  router.get('/telefonos', verificarToken(), telefonoController.getAllTelefonos);
  router.put('/telefonos/:telefonoId', validarBodyVacio, verificarToken(), validarId('telefonoId'), telefonoController.updateTelefono);

  //Historico uso camion
  router.post('/historico-camion', validarBodyVacio, verificarToken(), historicoController.registrarUsoCamion);
  router.get('/historico-camion/asignacion', verificarToken(), historicoController.obtenerAsignacionesActuales);
  router.get('/historico-camion', verificarToken(), historicoController.obtenerHistoricoPorCamionOEmpleado);

  //Servicios
  router.post('/servicios', validarBodyVacio, verificarToken(), servicioController.nuevoServicio);
  router.get('/servicios', verificarToken(), servicioController.getServicios);
  router.get('/servicios/:camionId', verificarToken(), validarId('camionId'), servicioController.getServicioPorCamion);
  router.delete('/servicios/:servicioId', verificarToken(true), validarId('servicioId'), servicioController.deleteServicio);

  //Jornales
  router.post('/jornales', validarBodyVacio, verificarToken(), jornalController.nuevoJornal);
  router.get('/jornales/:jornalId', verificarToken(), validarId('jornalId'), jornalController.getJornal);
  router.delete('/jornales/:jornalId', verificarToken(true), validarId('jornalId'), jornalController.borrarJornal);
  router.put('/jornales/:jornalId', validarBodyVacio, verificarToken(true), validarId('jornalId'), jornalController.editarJornal);

  //router.get('/jornales/horas/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getHorasPorEmpleado);
  router.get('/jornales/todos/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getAllJornalesPorPeriodo);
  router.get('/jornales/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getJornalesPorEmpleado);

  // Empresas
  router.post('/empresas', validarBodyVacio, verificarToken(), empresaController.createEmpresa);
  router.get('/empresas', verificarToken(), empresaController.getAllEmpresas);
  router.get('/empresas/:empresaId', verificarToken(), validarId('empresaId'), empresaController.getEmpresa);
  router.put('/empresas/:empresaId', validarBodyVacio, verificarToken(), validarId('empresaId'), empresaController.updateEmpresa);
  router.delete('/empresas/:empresaId', verificarToken(true), validarId('empresaId'), empresaController.deleteEmpresa);

  // ContactoEmpresas
  router.post('/contacto-empresas', validarBodyVacio, verificarToken(), contactoEmpresaController.createContactoEmpresa);
  router.get('/contacto-empresas', verificarToken(), contactoEmpresaController.getAllContactoEmpresas);
  router.get('/contacto-empresas/:contactoEmpresaId', verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.getContactoEmpresa);
  router.put('/contacto-empresas/:contactoEmpresaId', validarBodyVacio, verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.updateContactoEmpresa);
  router.put('/contacto-empresas/asignar/:contactoEmpresaId', validarBodyVacio, verificarToken(), validarId('contactoEmpresaId'), contactoEmpresaController.asignarObra);
  router.delete('/contacto-empresas/:contactoEmpresaId', verificarToken(true), validarId('contactoEmpresaId'), contactoEmpresaController.deleteContactoEmpresa);

  // Obras
  router.post('/obras', validarBodyVacio, verificarToken(), obrasController.createObra);
  router.get('/obras', verificarToken(), obrasController.getAllObras);
  router.get('/obras/:obraId', verificarToken(), validarId('obraId'), obrasController.getObra);
  router.put('/obras/:obraId', validarBodyVacio, verificarToken(), validarId('obraId'), obrasController.updateObra);
  router.put('/obras-detalle/:obraId', validarBodyVacio, verificarToken(), validarId('obraId'), obrasController.updateObraDetalles);
  router.delete('/obras/:obraId', verificarToken(true), validarId('obraId'), obrasController.deleteObra);

  return router;
};
