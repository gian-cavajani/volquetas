const { Ubicaciones } = require('../models');

// GET ALL
exports.getAllUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await Ubicaciones.findAll();
    res.status(200).json(ubicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todas las ubicaciones', detalle: error });
  }
};

// GET
exports.getUbicacion = async (req, res) => {
  try {
    const ubicacion = await Ubicaciones.findByPk(req.params.id);
    if (!ubicacion) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    res.status(200).json(ubicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la ubicación', detalle: error });
  }
};

// POST
exports.createUbicacion = async (req, res) => {
  try {
    const ubicacion = await Ubicaciones.create(req.body);
    res.status(201).json(ubicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la ubicación', detalle: error });
  }
};

// PUT
exports.updateUbicacion = async (req, res) => {
  try {
    const [updated] = await Ubicaciones.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    const updatedUbicacion = await Ubicaciones.findByPk(req.params.id);
    res.status(200).json(updatedUbicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la ubicación', detalle: error });
  }
};
