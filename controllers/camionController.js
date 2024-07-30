const { Camiones, Empleados } = require('../models');
const validator = require('validator');

exports.nuevoCamion = async (req, res) => {
  try {
    const { matricula, modelo, anio, estado } = req.body;

    if (!matricula || !modelo) {
      return res.status(400).json({ error: 'No tiene matricula o modelo' });
    }

    // Crear el nuevo camion
    const nuevoCamion = await Camiones.create({
      matricula,
      modelo,
      anio,
      estado,
    });

    res.status(201).json(nuevoCamion);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear camion', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getCamiones = async (req, res) => {
  try {
    const camiones = await Camiones.findAll();
    res.status(200).json(camiones);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener camiones', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener camiones', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getCamion = async (req, res) => {
  try {
    const camion = await Camiones.findByPk(req.params.camionId);
    if (!camion) return res.status(404).json({ error: 'Camion no encontrados' });
    res.status(200).json(camion);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener camion', detalle: error.message, stack: error.stack });
    }
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
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar camion', detalle: error.message, stack: error.stack });
    }
  }
};

exports.borrarCamion = async (req, res) => {
  try {
    const { camionId } = req.params;

    // Buscar el camión por ID
    const camion = await Camiones.findByPk(camionId);
    if (!camion) {
      return res.status(404).json({ error: 'Camión no encontrado' });
    }

    // Borrar el camión
    await camion.destroy();

    res.status(200).json({ message: 'Camión borrado exitosamente' });
  } catch (error) {
    cconsole.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar camion', detalle: error.message, stack: error.stack });
    }
  }
};
