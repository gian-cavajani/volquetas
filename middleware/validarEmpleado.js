const { body, param, validationResult } = require('express-validator');

// Middleware para validar y sanitizar la creación de un nuevo empleado
const validateNuevoEmpleado = [
  body('nombre')
    .isString()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .escape(),
  body('cedula')
    .isInt()
    .isLength({ min: 8, max: 8 })
    .withMessage('La cédula debe tener 8 caracteres')
    .escape(),
  body('rol')
    .isIn(['admin', 'normal', 'chofer'])
    .withMessage('El rol debe ser "admin", "normal", o "chofer"')
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Middleware para validar el ID de empleado
const validateEmpleadoId = [
  param('empleadoId')
    .isInt()
    .withMessage('El ID del empleado debe ser un entero'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateNuevoEmpleado,
  validateEmpleadoId,
};
