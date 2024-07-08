const { where } = require('sequelize');
const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados, Volquetas } = require('../models');
const validator = require('validator');

exports.modificarPago = async (req, res) => {
  const { pagoPedidoId } = req.params;
  const { remito, precio, pagado, tipoPago } = req.body;
  try {
    const pagoPedido = await PagoPedidos.findByPk(pagoPedidoId);
    if (!pagoPedido) return res.status(404).json({ error: 'Pago del Pedido no existe' });

    if (tipoPago && !['transferencia', 'efectivo', 'cheque'].includes(tipoPago)) {
      return res.status(400).json({ error: "Tipo de pago debe ser válido, opciones: ('transferencia', 'efectivo', 'cheque')" });
    }
    if (precio && !validator.isFloat(precio.toString())) {
      return res.status(400).json({ error: 'El campo precio debe ser un número válido.' });
    }
    pagoPedido.precio = precio !== undefined ? precio : pagoPedido.precio;
    pagoPedido.remito = remito ? remito : pagoPedido.remito;
    pagoPedido.tipoPago = tipoPago ? tipoPago : pagoPedido.tipoPago;
    pagoPedido.pagado = pagado !== undefined ? pagado : pagoPedido.pagado;
    await pagoPedido.save();

    res.status(202).json(pagoPedido);
  } catch (error) {
    console.error('Error al modificar el pago:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];
    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar el pago', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar el pago', detalle: error.message });
    }
  }
};
