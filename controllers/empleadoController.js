const { Empleados, Telefonos } = require('../models');
const bcrypt = require('bcryptjs');
const validator = require('validator');

exports.nuevoEmpleado = async (req, res) => {
  const {
    nombre,
    cedula,
    rol,
    // camionId, telefonos
  } = req.body;
  try {
    //Sanitizar campos
    const sanitizednombre = nombre ? validator.escape(nombre) : '';
    const sanitizedrol = rol ? validator.escape(rol) : '';
    if (cedula.toString().length !== 8) {
      return res
        .status(400)
        .json({ error: 'Cedula invalida, deben ser 8 numeros' });
    }
    // if (
    //   !Array.isArray(telefonos) ||
    //   telefonos.some((tel) => !validator.isMobilePhone(tel, 'any'))
    // ) {
    //   return res.status(400).json({ error: 'Teléfonos inválidos' });
    // }

    // Crear el empleado
    const nuevoEmpleado = await Empleados.create({
      nombre: sanitizednombre,
      cedula,
      rol: sanitizedrol,
      // camionId
    });

    // Crear los telefonos (NO LO AGREGO ACA NO SE INSERTAN SI YA EXISTEN)
    // const nuevosTelefonos = await Promise.all(telefonos.map(async (tel) => {
    //   const [telefono, created] = await Telefonos.findOrCreate({
    //     where: { telefono: tel },
    //     defaults: { empleadoId: nuevoEmpleado.id }
    //   });
    //   return telefono;
    // }));

    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    const errorsSequelize = error.errors
      ? error.errors.map((err) => err.message)
      : [];
    res
      .status(500)
      .json({ message: 'Error al crear empleado', error: errorsSequelize });
  }
};

exports.getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleados.findAll({
      include: {
        model: Telefonos,
        attributes: ['telefono'],
      },
    });

    res.status(200).json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
};

exports.getEmpleado = async (req, res) => {
  try {
    const empleado = await Empleados.findByPk(req.params.empleadoId, {
      include: {
        model: Telefonos,
        attributes: ['telefono'],
      },
    });

    res.status(200).json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
};
