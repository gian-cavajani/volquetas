const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/verificarToken'); //verifica token de cualquier usuario
const verificarTokenAdmin = require('../middleware/verificarTokenAdmin'); //verifica token de admin

//Controllers:
const usuarioController = require('../controllers/usuarioController');
const camionController = require('../controllers/camionController');
const empleadoController = require('../controllers/empleadoController');
const historicoController = require('../controllers/historicoController');
const servicioController = require('../controllers/servicioController');

module.exports = function () {
  //healthcheck
  router.get('/', (req, res) => {
    res.json(`Servidor corriendo en el puerto ${process.env.PORT}`);
  });

  //Usuarios
  router.post('/usuarios', usuarioController.nuevoUsuario);
  router.get('/usuarios', verificarTokenAdmin, usuarioController.getUsuarios);
  router.post('/usuarios/login', usuarioController.loginUsuario);
  router.post(
    '/usuarios/confirmar',
    verificarTokenAdmin,
    usuarioController.confirmarUsuario
  );

  //Camiones
  router.post('/camiones', verificarToken, camionController.nuevoCamion);
  router.get('/camiones', verificarToken, camionController.getCamiones);

  //Empleados
  router.post('/empleados', verificarToken, empleadoController.nuevoEmpleado);
  router.get('/empleados', verificarToken, empleadoController.getEmpleados);
  router.get(
    '/empleados/:empleadoId',
    verificarToken,
    empleadoController.getEmpleado
  );

  //Historico uso camion
  router.post(
    '/historico-camion',
    verificarToken,
    historicoController.registrarUsoCamion
  );
  router.get(
    '/historico-camion/asignacion',
    verificarToken,
    historicoController.obtenerAsignacionesActuales
  );
  router.get(
    '/historico-camion',
    verificarToken,
    historicoController.obtenerHistoricoPorCamionOEmpleado
  );

  //Servicios
  router.post('/servicios', verificarToken, servicioController.nuevoServicio);
  router.get('/servicios', verificarToken, servicioController.getServicios);
  router.get(
    '/servicios/:camionId',
    verificarToken,
    servicioController.getServicioPorCamion
  );

  return router;
};
