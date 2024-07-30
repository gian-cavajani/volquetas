const { Servicios, Camiones } = require('../models');
const { Op, Sequelize } = require('sequelize');
const validator = require('validator');

exports.nuevoServicio = async (req, res) => {
  const { precio, camionId, tipo, fecha, descripcion, moneda } = req.body;

  try {
    const camion = await Camiones.findOne({ where: { id: camionId } });
    //validar que camion exista
    if (!camion) throw Error('Camion no existe');

    if (!['arreglo', 'service', 'chequeo', 'pintura'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!['peso', 'dolar'].includes(moneda)) return res.status(400).json({ error: 'Moneda inválida' });

    const nuevoServicio = await Servicios.create({
      camionId,
      fecha,
      descripcion,
      tipo,
      precio,
      moneda,
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el servicio', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el servicio', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getServicios = async (req, res) => {
  try {
    const servicios = await Servicios.findAll({
      // include: {
      //   model: Camiones,
      // },
    });
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los servicios', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los servicios', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getServicioPorCamion = async (req, res) => {
  try {
    const servicios = await Servicios.findAll({
      where: { camionId: req.params.camionId },
    });
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los servicios por camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los servicios por camion', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getServiciosPorCamionMensual = async (req, res) => {
  const { month, year, camionId } = req.query; // Se esperan los parámetros 'month', 'year' y 'camionId' en la query

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: 'Mes inválido. Debe ser un número entre 1 y 12.' });
  }

  if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
    return res.status(400).json({ error: 'Año inválido.' });
  }

  try {
    let whereClause = {
      fecha: {
        [Op.and]: [Sequelize.literal(`EXTRACT(MONTH FROM fecha) = ${month}`), Sequelize.literal(`EXTRACT(YEAR FROM fecha) = ${year}`)],
      },
    };

    if (camionId) {
      whereClause.camionId = camionId;
    }

    const servicios = await Servicios.findAll({
      where: whereClause,
    });

    res.status(200).json(servicios);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los servicios', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los servicios', detalle: error.message, stack: error.stack });
    }
  }
};

exports.deleteServicio = async (req, res) => {
  const { servicioId } = req.params;

  try {
    const servicio = await Servicios.findByPk(servicioId);

    if (!servicio) return res.status(404).json({ error: 'El servicio con ese id no existe' });
    await servicio.destroy();

    res.status(200).json({ detalle: `El servicio fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar el servicio', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar el servicio', detalle: error.message, stack: error.stack });
    }
  }
};
