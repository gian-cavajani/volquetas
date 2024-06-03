const { Servicios, Camiones } = require('../models');
const validator = require('validator');

exports.nuevoServicio = async (req, res) => {
  const { precio, camionId, tipo, fecha, descripcion } = req.body;

  try {
    const camion = await Camiones.findOne({ where: { id: camionId } });
    //validar que camion exista
    if (!camion) throw Error('Camion no existe');

    //sanitizar
    const sanitizeddescripcion = validator.escape(descripcion); // Crear el nuevo registro de histórico de uso de camión

    const nuevoServicio = await Servicios.create({
      camionId,
      fecha,
      descripcion: sanitizeddescripcion,
      tipo,
      precio,
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error('Error al crear Servicio de camión:', error);
    res
      .status(500)
      .json({ message: 'Error al Servicio de camión', error: error.message });
  }
};

exports.getServicios = async (req, res) => {
  try {
    const servicios = await Servicios.findAll({
      include: {
        model: Camiones,
      },
    });
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};

exports.getServicioPorCamion = async (req, res) => {
  try {
    const servicios = await Servicios.findAll({
      where: { camionId: req.params.camionId },
    });
    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los servicios' });
  }
};
