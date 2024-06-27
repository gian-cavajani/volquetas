// middlewares/validateEmpleado.js
const validator = require('validator');

const validateEmpleado = (req, res, next) => {
  const { nombre, cedula, email, descripcion, rol, fechaEntrada, fechaSalida } = req.body;
  let errors = [];

  if (!nombre || validator.isEmpty(nombre)) {
    errors.push({ msg: 'El nombre es obligatorio' });
  }

  if (cedula && (!validator.isLength(cedula, { min: 8, max: 8 }) || !validator.isNumeric(cedula))) {
    errors.push({ msg: 'La cédula debe tener 8 caracteres numéricos' });
  }

  if (email && !validator.isEmail(email)) {
    errors.push({ msg: 'El email no es válido' });
  }

  if (rol && !['admin', 'normal', 'chofer'].includes(rol)) {
    errors.push({ msg: 'El rol no es válido' });
  }

  if (fechaEntrada && !validator.isISO8601(fechaEntrada)) {
    errors.push({ msg: 'La fecha de entrada no es válida' });
  }

  if (fechaSalida && !validator.isISO8601(fechaSalida)) {
    errors.push({ msg: 'La fecha de salida no es válida' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateEmpleado;
