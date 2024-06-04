const { Camiones, Empleados } = require('../models');
const validator = require('validator');

exports.nuevoCamion = async (req, res) => {
  try {
    const { matricula, modelo, anio, estado } = req.body;

    if (!matricula || !modelo) {
      return res.status(400).json({ error: 'No tiene matricula o modelo' });
    }

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

exports.getCamion = async (req, res) => {
  try {
    const camion = await Camiones.findByPk(req.params.camionId);
    res.status(200).json(camion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el camion' });
  }
};

exports.actualizarCamion = async (req, res) => {
  const { matricula, modelo, anio, estado } = req.body;

  try {
    const camion = await Camiones.findByPk(req.params.camionId);
    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    camion.matricula = matricula || camion.matricula;
    camion.modelo = modelo || camion.modelo;
    camion.anio = anio || camion.anio;
    camion.estado = estado || camion.estado;

    await camion.save();

    res.status(200).json(camion);
  } catch (error) {
    console.error('Error al actualizar el camión:', error);
    res
      .status(500)
      .json({ error: 'Error al actualizar el camión', detalle: error });
  }
};
