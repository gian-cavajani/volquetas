const { where } = require('sequelize');
const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados, Volquetas } = require('../models');
const validator = require('validator');

exports.createSugerencia = async (req, res) => {
  try {
    const { horarioSugerido, choferSugeridoId, tipoSugerido, pedidoId } = req.body;

    const pedido = await Pedidos.findByPk(pedidoId);
    if (!pedido) {
      return res.status(400).json({ error: 'Pedido no encontrado' });
    }

    if (!(tipoSugerido === 'entrega' || tipoSugerido === 'levante')) {
      return res.status(400).json({ error: 'tipoSugerido solo puede ser "entrega" o "levante"' });
    }

    const sugerenciaEntrega = await pedido.getSugerenciaEntrega;
    const sugerenciaLevante = await pedido.getSugerenciaLevante;
    if (tipoSugerido === 'entrega' && sugerenciaEntrega) return res.status(400).json({ error: 'Pedido ya tiene una sugerencia de entrega, eliminela o modifiquela' });
    if (tipoSugerido === 'levante' && sugerenciaLevante) return res.status(400).json({ error: 'Pedido ya tiene una sugerencia de levante, eliminela o modifiquela' });

    if (choferSugeridoId) {
      const chofer = await Empleados.findByPk(choferSugeridoId);
      if (!chofer || !chofer.habilitado || chofer.rol !== 'chofer') {
        return res.status(400).json({ error: 'Chofer no válido o no habilitado' });
      }
    }

    const nuevaSugerencia = await Sugerencias.create({
      horarioSugerido,
      choferSugeridoId,
      tipoSugerido,
      pedidoId,
    });

    res.status(201).json(nuevaSugerencia);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la sugerencia', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la sugerencia', detalle: error.message, stack: error.stack });
    }
  }
};

exports.updateSugerencia = async (req, res) => {
  try {
    const { sugerenciaId } = req.params;
    const { horarioSugerido, choferSugeridoId } = req.body;

    // Validar sugerencia existente
    const sugerencia = await Sugerencias.findByPk(sugerenciaId);
    if (!sugerencia) {
      return res.status(404).json({ error: 'Sugerencia no encontrada' });
    }

    // Validar chofer
    if (choferSugeridoId) {
      const chofer = await Empleados.findByPk(choferSugeridoId);
      if (!chofer || !chofer.habilitado || chofer.rol !== 'chofer') {
        return res.status(400).json({ error: 'Chofer no válido o no habilitado' });
      }
    }

    // Actualizar sugerencia
    sugerencia.horarioSugerido = horarioSugerido ? horarioSugerido : sugerencia.horarioSugerido;
    sugerencia.choferSugeridoId = choferSugeridoId ? choferSugeridoId : sugerencia.choferSugeridoId;
    await sugerencia.save();

    res.status(202).json(sugerencia);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar la sugerencia', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar la sugerencia', detalle: error.message, stack: error.stack });
    }
  }
};

exports.deleteSugerencia = async (req, res) => {
  try {
    const sugerencia = await Sugerencias.findByPk(req.params.sugerenciaId);
    if (!sugerencia) return res.status(404).json({ error: 'Sugerencia no encontrada' });

    await sugerencia.destroy();

    res.status(200).json({ message: 'Sugerencia eliminada exitosamente' });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar la sugerencia', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar la sugerencia', detalle: error.message, stack: error.stack });
    }
  }
};
