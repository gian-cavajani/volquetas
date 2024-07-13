const { Op } = require('sequelize');
const { PagoPedidos, Facturas, Pedidos, Obras } = require('../models');

exports.crearFactura = async (req, res) => {
  //chequear si tiene factura, chequear si esta pagado, chequear si factura.empresaId === pedido.empresaId
  const { pedidosIds, numeracion, tipo, fechaPago, descripcion, empresaId, particularId } = req.body;
  console.log(pedidosIds);
  if ((empresaId && particularId) || (!empresaId && !particularId)) {
    //to do: confirmar que funciona y agregar a otros metodos(obra,permiso,telefono)
    return res.status(400).json({ error: 'Debe proporcionar solo uno: empresaId o particularId.' });
  }
  if (!['credito', 'contado', 'recibo'].includes(tipo)) {
    return res.status(400).json({ error: "Tipo de pago debe ser válido, opciones: ('credito', 'contado', 'recibo')" });
  }
  if (!pedidosIds || pedidosIds.length === 0) {
    return res.status(400).json({ error: 'Debe proporcionar al menos un ID de pedido.' });
  }

  try {
    const pedidos = await Pedidos.findAll({
      where: {
        id: { [Op.in]: pedidosIds },
      },
      attributes: ['id', 'estado'],
      include: [
        {
          model: PagoPedidos,
          as: 'pagoPedido',
          attributes: ['id', 'pagado', 'precio', 'facturaId'],
        },
        {
          model: Obras,
          // as: 'obra',
          attributes: ['id', 'empresaId', 'particularId'],
        },
      ],
    });

    if (pedidos.length !== pedidosIds.length) return res.status(400).json({ error: 'Alguno de los pedidos no existe' });

    for (const pedido of pedidos) {
      if (pedido.pagoPedido.facturaId !== null) {
        return res.status(400).json({ error: `El pedido con ID ${pedido.id} ya tiene una factura.` });
      }
      if (pedido.pagoPedido.pagado) {
        return res.status(400).json({ error: `El pedido con ID ${pedido.id} ya está pagado.` });
      }
      if (empresaId === null || empresaId === undefined) {
        if (pedido.Obra.particularId !== particularId) {
          return res.status(400).json({ error: `El pedido con ID ${pedido.id} no pertenece al mismo cliente.` });
        }
      }
      if (particularId === null || particularId === undefined) {
        if (pedido.Obra.empresaId !== empresaId) {
          return res.status(400).json({ error: `El pedido con ID ${pedido.id} no pertenece al mismo cliente.` });
        }
      }
    }

    // Calcular el monto total de la factura
    const monto = pedidos.reduce((total, pedido) => total + (pedido.pagoPedido.precio || 0), 0);

    const pagoPedidosIds = pedidos.map((p) => p.pagoPedido.id);

    // Crear la factura
    const factura = await Facturas.create({
      numeracion,
      tipo,
      monto,
      fechaPago,
      descripcion,
      empresaId: empresaId || null,
      particularId: particularId || null,
      estado: fechaPago ? 'pagada' : 'pendiente',
    });

    // Actualizar los pedidos con el ID de la factura
    await PagoPedidos.update(
      {
        facturaId: factura.id,
        pagado: fechaPago ? true : false,
      },
      {
        where: {
          id: {
            [Op.in]: pagoPedidosIds,
          },
        },
      }
    );

    res.status(201).json(factura);
  } catch (error) {
    console.error('Error al crear la factura:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];
    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la factura', detalle: error.message });
    }
  }
};

exports.getFacturas = async (req, res) => {
  const { ultimos, fechaInicio, fechaFin, empresaId, particularId, estado } = req.query;

  if (empresaId && particularId) {
    return res.status(400).json({ error: 'Debe proporcionar solo uno o ninguno: empresaId o particularId.' });
  }
  if (ultimos && ultimos > 50) return res.status(400).json({ error: 'No se pueden traer mas de 50 facturas a la vez' });
  if (estado && !['pendiente', 'anulada', 'pagada'].includes(estado)) {
    return res.status(400).json({ error: "La factura solo puede estar: ('pendiente', 'anulada', 'pagada')" });
  }

  const whereClause = {};
  if (estado) whereClause.estado = estado;
  if (particularId) whereClause.particularId = particularId;
  if (empresaId) whereClause.empresaId = empresaId;

  if (fechaInicio && fechaFin) {
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });
    whereClause.createdAt = { [Op.between]: [startDate, endDate] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  try {
    const facturas = await Facturas.findAll({
      order: [['createdAt', 'DESC']],
      limit: ultimos ? ultimos : 50,
      where: whereClause,
    });

    res.json(facturas);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener facturas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener facturas', detalle: error });
    }
  }
};

exports.getFactura = async (req, res) => {
  const { facturaId } = req.params;
  try {
    const factura = await Facturas.findByPk(facturaId);
    if (!factura) {
      return res.status(404).json({ error: 'factura no encontrada' });
    }
    res.status(200).json(factura);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la factura', detalle: error });
    }
  }
};

exports.modificarFactura = async (req, res) => {
  const { numeracion, tipo, fechaPago, descripcion } = req.body;
  const { facturaId } = req.params;

  if (isNaN(Date.parse(fechaPago))) return res.status(400).json({ error: 'La fecha de pago debe ser válida' });
  if (!['credito', 'contado', 'recibo'].includes(tipo)) {
    return res.status(400).json({ error: "Tipo de pago debe ser válido, opciones: ('credito', 'contado', 'recibo')" });
  }

  try {
    const factura = await Facturas.findByPk(facturaId);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    if (factura.estado === 'anulada') return res.status(400).json({ error: 'No se puede modificar una factura anulada' });

    if (factura.pagada && fechaPago) factura.fechaPago = fechaPago;
    if (descripcion) factura.descripcion = descripcion;
    if (tipo) factura.tipo = tipo;
    if (numeracion) factura.numeracion = numeracion;

    factura.save();

    res.status(200).json(factura);
  } catch (error) {
    console.log(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: error });
    }
  }
};

exports.recalcularMonto = async (req, res) => {
  const { facturaId } = req.params;
  try {
    const factura = await Facturas.findByPk(facturaId);
    if (!factura) return res.status(400).json({ error: 'Factura no existe' });
    if (factura.estado === 'pagada') return res.status(400).json({ error: 'Factura ya pagada' });
    if (factura.estado === 'anulada') return res.status(400).json({ error: 'No se puede modificar una factura anulada' });

    const montoAnterior = factura.monto;
    const pedidos = await PagoPedidos.findAll({ where: { facturaId: facturaId } });
    const monto = pedidos.reduce((total, pedido) => total + (pedido.precio || 0), 0);

    factura.monto = monto;
    factura.save();

    res.status(200).json({ detalle: `Monto Anterior: ${montoAnterior}, Nuevo Monto: ${monto}` });
  } catch (error) {
    console.log(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: error });
    }
  }
};

exports.cambiarEstadoFactura = async (req, res) => {
  const { facturaId } = req.params;
  const { fechaPago, estado } = req.body;

  try {
    const factura = await Facturas.findByPk(facturaId);
    if (!factura) return res.status(400).json({ error: 'Factura no existe' });
    if (factura.estado === 'anulada') return res.status(400).json({ error: 'No se puede modificar una factura anulada' });

    if (estado === 'pagada') {
      if (factura.estado === 'pagada') return res.status(400).json({ error: 'Factura ya esta pagada' });
      if (!fechaPago || isNaN(Date.parse(fechaPago))) return res.status(400).json({ error: 'La fecha de pago es obligatoria y debe ser válida' });

      const pagoPedidos = await PagoPedidos.findAll({ where: { facturaId: facturaId } });
      for (const pedido of pagoPedidos) {
        if (pedido.pagado) return res.status(400).json({ error: `Uno de los pedidos de esta factura ya está pagado.` });
      }

      await PagoPedidos.update({ pagado: true }, { where: { facturaId: facturaId } });

      factura.estado = 'pagada';
      factura.fechaPago = fechaPago;
    } else if (estado === 'anulada') {
      await PagoPedidos.update({ pagado: false, facturaId: null }, { where: { facturaId: facturaId } });

      factura.estado = 'anulada';
      factura.fechaPago = null;
    } else if (estado === 'pendiente') {
      if (factura.estado === 'pendiente') return res.status(400).json({ error: 'Factura ya esta pendiente' });

      await PagoPedidos.update({ pagado: false }, { where: { facturaId: facturaId } });

      factura.estado = 'pendiente';
      factura.fechaPago = null;
    } else {
      return res.status(400).json({ error: "Solo se puede cambiar a estado de factura: ('anulada', 'pagada', 'pendiente')" });
    }

    factura.save();

    res.status(200).json(factura);
  } catch (error) {
    console.log(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar Factura', detalle: error });
    }
  }
};

exports.eliminarFactura = async (req, res) => {
  const { facturaId } = req.params;

  try {
    const factura = await Facturas.findByPk(facturaId);
    if (!factura) return res.status(400).json({ error: 'Factura no existe' });
    if (factura.estado === 'pagada') return res.status(400).json({ error: 'No se puede eliminar una factura pagada' });
    await PagoPedidos.update({ facturaId: null }, { where: { facturaId: facturaId } });

    await factura.destroy();

    res.status(201).json({ detalle: 'Factura Eliminada Correctamente' });
  } catch (error) {
    console.log(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al Eliminar Factura', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al Eliminar Factura', detalle: error });
    }
  }
};
