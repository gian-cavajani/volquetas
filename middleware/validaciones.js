const jwt = require('jsonwebtoken');
const validator = require('validator');
const sanitizeData = require('../utils/sanitize');

//Middleware para validar el id de los parametros
const validarId = (paramName) => (req, res, next) => {
  const paramValue = req.params[paramName];

  console.log(paramValue);
  if (isNaN(parseInt(paramValue, 10))) {
    return res.status(400).json({ error: `El parámetro ${paramName} debe ser un entero` });
  }

  next();
};

// Validar que fechaInicio y fechaFin tengan el formato YYYY-MM-DD
const validarFechaParams = (req, res, next) => {
  const { fechaInicio, fechaFin } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
    return res.status(400).json({ error: 'El formato de las fechas debe ser YYYY-MM-DD' });
  }
  next();
};
//Esta función verifica el token y, opcionalmente,
//verifica si el usuario es administrador si se pasa un parámetro adicional:
const verificarToken = (requireAdmin) => (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRETO);
    req.user = decoded;

    if (requireAdmin && decoded.rol !== 'admin') {
      return res.status(401).json({ error: 'Debe iniciar sesión como administrador.' });
    }

    next();
  } catch (error) {
    console.error({ error });
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'El token expiró, inicie sesión nuevamente' });
    }
    return res.status(401).json({ error: 'Token inválido, inicie sesión nuevamente' });
  }
};

const validarBodyVacioYSanitizar = (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío' });
  }
  req.body = sanitizeData(req.body);
  next();
};

module.exports = {
  validarId,
  validarFechaParams,
  verificarToken,
  validarBodyVacioYSanitizar,
};
