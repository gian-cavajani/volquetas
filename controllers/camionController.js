const { Camiones, Empleados } = require('../models');
const validator = require('validator');

exports.nuevoCamion = async (req, res) => {
  try {
    const { matricula, modelo, anio, estado } = req.body;

    //sanitiza datos para no tener inyecciones sql
    const sanitizedmatricula = matricula ? validator.escape(matricula) : '';
    const sanitizedmodelo = modelo ? validator.escape(modelo) : '';
    const sanitizedestado = estado ? validator.escape(estado) : '';

    // Crear el nuevo camion
    const nuevoCamion = await Camiones.create({
      matricula: sanitizedmatricula,
      modelo: sanitizedmodelo,
      anio: anio,
      estado: sanitizedestado,
    });

    res.status(201).json(nuevoCamion);
  } catch (error) {
    const errorsSequelize = error.errors
      ? error.errors.map((err) => err.message)
      : [];
    res
      .status(500)
      .json({ error: 'Error al crear camion', detalle: errorsSequelize });
  }
};

exports.getCamiones = async (req, res) => {
  try {
    const camiones = await Camiones.findAll();
    res.status(200).json(camiones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los camiones' });
  }
};
