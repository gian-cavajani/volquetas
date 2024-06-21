const { Servicios, Camiones } = require('../models');
const validator = require('validator');

exports.nuevoServicio = async (req, res) => {
  const { precio, camionId, tipo, fecha, descripcion, moneda } = req.body;

  try {
    const camion = await Camiones.findOne({ where: { id: camionId } });
    //validar que camion exista
    if (!camion) throw Error('Camion no existe');

    //sanitizar
    const sanitizeddescripcion = validator.escape(descripcion); // Crear el nuevo registro de histórico de uso de camión
    const sanitizedMoneda = validator.escape(moneda);
    const sanitizedTipo = validator.escape(tipo);

    if (!['arreglo', 'service', 'chequeo', 'pintura'].includes(sanitizedTipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!['peso', 'dolar'].includes(sanitizedMoneda)) return res.status(400).json({ error: 'Moneda inválida' });

    const nuevoServicio = await Servicios.create({
      camionId,
      fecha,
      descripcion: sanitizeddescripcion,
      tipo: sanitizedTipo,
      precio,
      moneda: sanitizedMoneda,
    });

    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error('Error al crear Servicio de camión:', error);
    res.status(500).json({ error: 'Error al Servicio de camión', detalle: error.message });
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

exports.deleteServicio = async (req, res) => {
  const { servicioId } = req.params;

  try {
    const servicio = await Servicios.findByPk(servicioId);

    if (!servicio) return res.status(404).json({ error: 'El servicio con ese id no existe' });
    await servicio.destroy();

    res.status(200).json({ detalle: `El servicio fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al eliminar el servicio', detalle: error });
  }
};
