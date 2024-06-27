// controllers/personasController.js
const { Personas } = require('../models/');
const validator = require('validator');

const crearPersona = async (personaData) => {
  const { nombre, cedula, email, descripcion } = personaData;

  // Validar que los campos requeridos no estén vacíos
  if (!nombre || validator.isEmpty(nombre)) throw new Error('El nombre es obligatorio');

  if (cedula && (!validator.isLength(cedula, { min: 8, max: 8 }) || !validator.isNumeric(cedula))) {
    throw new Error('La cédula debe tener 8 caracteres numéricos');
  }

  if (email && !validator.isEmail(email)) throw new Error('El email no es válido');

  // Crear una nueva persona en la base de datos
  const nuevaPersona = await Personas.create({
    nombre,
    cedula,
    email,
    descripcion,
  });

  return nuevaPersona;
};

module.exports = { crearPersona };
