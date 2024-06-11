const express = require('express');
const router = express.Router();

//Middleware
const { validarId, validarFechaParams, verificarToken } = require('../middleware/validaciones');

//Controllers:
const usuarioController = require('../controllers/usuarioController');
const camionController = require('../controllers/camionController');
const empleadoController = require('../controllers/empleadoController');
const historicoController = require('../controllers/historicoController');
const servicioController = require('../controllers/servicioController');
const jornalController = require('../controllers/jornalController');

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
  router.get('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.getEmpleado);
  router.patch('/empleados/:empleadoId/estado', verificarToken(true), validarId('empleadoId'), empleadoController.cambiarEstadoEmpleado);
  router.put('/empleados/:empleadoId', verificarToken(), validarId('empleadoId'), empleadoController.modificarEmpleado);
  router.delete('/empleados/:empleadoId', verificarToken(true), validarId('empleadoId'), empleadoController.eliminarEmpleado);

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

  router.get('/jornales/horas/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getHorasPorEmpleado);
  router.get('/jornales/todos/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getAllJornalesPorPeriodo);
  router.get('/jornales/:empleadoId/:fechaInicio/:fechaFin', verificarToken(), validarFechaParams, jornalController.getJornalesPorEmpleado);

  return router;
};
