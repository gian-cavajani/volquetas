const Pedidos = require('../models/Pedidos');
const Movimientos = require('../models/Movimientos');
const Sugerencias = require('../models/Sugerencias');

const validarCantidadAsociados = async (req, res, next) => {
  try {
    const { pedidoId } = req.body;

    const pedido = await Pedidos.findByPk(pedidoId, {
      include: [Movimientos, Sugerencias],
    });

    if (pedido) {
      const numMovimientos = pedido.Movimientos.length;
      const numSugerencias = pedido.Sugerencias.length;

      if (numMovimientos >= 2) {
        return res.status(400).json({ error: 'El pedido ya tiene 2 movimientos.' });
      }

      if (numSugerencias >= 2) {
        return res.status(400).json({ error: 'El pedido ya tiene 2 sugerencias.' });
      }
    }

    next();
  } catch (error) {
    console.error('Error al validar cantidad de asociados:', error);
    res.status(500).json({ error: 'Error al validar cantidad de asociados.', detalle: error.message });
  }
};

module.exports = validarCantidadAsociados;
