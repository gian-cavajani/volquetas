//Middleware para validar el id de los parametros
const validarId = (paramName) => (req, res, next) => {
  const paramValue = req.params[paramName];

  console.log(paramValue);
  if (isNaN(parseInt(paramValue, 10))) {
    return res.status(400).json({ error: `El parámetro ${paramName} debe ser un entero` });
  }

  next();
};

module.exports = {
  validarId,
};
