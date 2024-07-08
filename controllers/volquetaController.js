const { Volquetas, Empresas, Particulares } = require('../models');

exports.createVolqueta = async (req, res) => {
  const { numeroVolqueta, estado, tipo } = req.body;

  try {
    if (!['grande', 'chica'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!numeroVolqueta) return res.status(400).json({ error: 'Numero de volqueta es obligatorio' });
    const volqueta = await Volquetas.create({ numeroVolqueta, estado, tipo });

    res.status(201).json(volqueta);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la volqueta', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la volqueta', detalle: error });
    }
  }
};

exports.getVolquetaById = async (req, res) => {
  //TODO: aca traer Movimientos de volqueta...
  try {
    const volqueta = await Volquetas.findByPk(req.params.numeroVolqueta);
    if (!volqueta) {
      return res.status(404).json({ error: 'Volqueta no encontrada' });
    }
    res.json(volqueta);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la volqueta', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la volqueta', detalle: error });
    }
  }
};

exports.getAllVolquetas = async (req, res) => {
  try {
    const volquetas = await Volquetas.findAll();
    res.json(volquetas);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener las volquetas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener las volquetas', detalle: error });
    }
  }
};

exports.updateVolquetaById = async (req, res) => {
  const { numeroVolqueta } = req.params;
  try {
    const [updated] = await Volquetas.update(req.body, {
      where: { numeroVolqueta },
    });
    if (!updated) {
      return res.status(404).json({ error: 'Volqueta no encontrada' });
    }
    const updatedVolqueta = await Volquetas.findByPk(numeroVolqueta);
    res.json(updatedVolqueta);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar la volqueta', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar la volqueta', detalle: error });
    }
  }
};

exports.deleteVolquetaById = async (req, res) => {
  const { numeroVolqueta } = req.params;
  try {
    const deleted = await Volquetas.destroy({
      where: { numeroVolqueta },
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Volqueta no encontrada' });
    }
    res.status(204).json({ detalle: 'Volqueta eliminada' });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar la volqueta', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar la volqueta', detalle: error });
    }
  }
};
