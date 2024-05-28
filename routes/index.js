const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/verificarToken');
//Controllers:
const usuarioController = require('../controllers/usuarioController');

module.exports = function () {
  //healthcheck
  router.get('/', (req, res) => {
    res.json(`Servidor corriendo en el puerto ${process.env.PORT}`);
  });

  //Usuarios
  router.post('/usuarios', usuarioController.nuevoUsuario);

  router.get('/usuarios', verificarToken, usuarioController.getUsuarios);

  router.post('/login', usuarioController.loginUsuario);

  return router;
};
