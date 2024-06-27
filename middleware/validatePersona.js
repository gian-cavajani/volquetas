const validator = require('validator');

const validatePersona = (req, res, next) => {
  const { nombre, cedula, email, descripcion } = req.body;
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

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validatePersona;
