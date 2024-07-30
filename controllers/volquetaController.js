const { Obras, Volquetas, Movimientos, Pedidos } = require('../models');
const { Op } = require('sequelize');

exports.createVolqueta = async (req, res) => {
  const { numeroVolqueta, estado, tipo } = req.body;

  try {
    if (!['grande', 'chica'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!['ok', 'quemada', 'para pintar', 'perdida', 'inutilizable'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
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
  const { numeroVolqueta } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  try {
    let volquetasInclude = {};
    if (fechaInicio && fechaFin) {
      if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });
      volquetasInclude = {
        model: Movimientos,
        where: { horario: { [Op.between]: [fechaInicio, fechaFin] } },
        required: false,
      };
    } else {
      volquetasInclude = {
        model: Movimientos,
        limit: 1,
        order: [['horario', 'DESC']],
        required: false,
      };
    }

    const volqueta = await Volquetas.findByPk(numeroVolqueta, {
      include: [volquetasInclude],
    });
    if (!volqueta) return res.status(404).json({ error: 'Volqueta no encontrada' });

    res.status(200).json(volqueta);
  } catch (error) {
    console.error('Error al obtener movimientos de la volqueta:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener movimientos de la volqueta', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener movimientos de la volqueta', detalle: error });
    }
  }
};

exports.getAllVolquetas = async (req, res) => {
  try {
    const volquetas = await Volquetas.findAll({
      include: [
        {
          model: Movimientos,
          attributes: ['id', 'horario', 'tipo', 'choferId', 'pedidoId'],
          limit: 1,
          order: [['horario', 'DESC']],
          include: [{ model: Pedidos, attributes: ['id'], include: [{ model: Obras, attributes: ['id', 'calle'] }] }],
        },
      ],
    });

    res.status(200).json(volquetas);
  } catch (error) {
    console.error('Error al obtener volquetas con sus últimos movimientos:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener volquetas con sus últimos movimientos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener volquetas con sus últimos movimientos', detalle: error });
    }
  }
};

exports.updateVolquetaById = async (req, res) => {
  const { numeroVolqueta } = req.params;
  const { estado, tipo } = req.body;
  try {
    if (tipo && !['grande', 'chica'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (estado && !['ok', 'quemada', 'para pintar', 'perdida', 'inutilizable'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
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
