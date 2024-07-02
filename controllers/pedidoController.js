const { PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas } = require('../models');
const validator = require('validator'); // Usamos validator para validaciones y sanitización

const crearPedido = async (req, res, creadoComo) => {
  const creadoPor = req.user.id;
  const {
    obraId,
    descripcion,
    // estado,
    permisoId,
    // nroPesada,
    referenciaId,
    cantidadMultiple,

    //PAGOPEDIDOS -------------
    precio,
    pagado,
    // remito,
    tipoPago,

    //SUGERENCIA -------------
    horarioSugerido,
    // tipoSugerido,
    choferSugeridoId,

    //MOVIMIENTO -------------
    numeroVolqueta,
    fecha,
    horario,
    tipo,
    choferId,
  } = req.body;

  // Validaciones

  if (precio && !validator.isFloat(precio.toString())) throw new Error('El campo precio debe ser un número válido.');
  if (!obraId || !validator.isInt(obraId.toString())) throw new Error('Debe tener una obra y debe ser valida');
  if (tipoPago && !['credito', 'debito', 'efectivo', 'cheque', 'otros'].includes(tipoPago)) {
    throw new Error("Tipo de pago debe ser valido, opciones: ('credito', 'debito', 'efectivo', 'cheque', 'otros')");
  }

  const nuevoPago = await PagoPedidos.create({
    precio,
    pagado,
    tipoPago,
  });

  const pedido = { creadoPor, obraId, descripcion, estado: 'iniciado', creadoComo, permisoId, pagoPedidoId: nuevoPago.id };
  const nuevoPedido = await Pedidos.create(pedido);
  if (creadoComo === 'nuevo') {
  } else if (creadoComo === 'recambio') {
    nuevoPedido.referenciaId = referenciaId;
    nuevoPedido.save();
  } else if (creadoComo === 'multiple') {
    nuevoPedido.referenciaId = nuevoPedido.id;
    nuevoPedido.save();
    const multiples = [];

    for (let i = 0; i < cantidadMultiple; i++) {
      pedido.referenciaId = nuevoPedido.id;
      multiples.push(pedido);
    }

    const pedidosMultiples = await Pedidos.bulkCreate(multiples);
    console.log(pedidosMultiples);
  } else if (creadoComo === 'entrega mas levante') {
  }

  const nuevaSugerencia = await Sugerencias.create({
    pedidoId: nuevoPedido.id,
    horarioSugerido,
    tipoSugerido: 'entrega',
    choferSugeridoId,
  });
  //   console.log(nuevaSugerencia, nuevoPedido);
  return { nuevaSugerencia, nuevoPedido, nuevoPago };
};

// Controlador para crear un pedido
exports.createPedidoNuevo = async (req, res) => {
  try {
    const nuevoPedidoYSugerencia = await crearPedido(req, res, 'nuevo');

    res.status(201).json(nuevoPedidoYSugerencia);
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el pedido', detalle: error.message });
    }
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedidos.findAll({
      attributes: ['id'],
      include: [
        {
          model: PagoPedidos,
          as: 'pagoPedido',
          required: false,
          attributes: ['id', 'precio', 'pagado'],
        },
        {
          model: Sugerencias,
          required: false,
          attributes: ['id', 'tipoSugerido', 'horarioSugerido'],
        },
        {
          model: Movimientos,
          required: false,
          attributes: ['id', 'tipo', 'horario'],
        },
        {
          model: Obras,
          required: false,
          attributes: ['id'],
          include: [
            {
              model: Particulares,
              required: false,
              attributes: ['id'],
              as: 'particular',
            },
            {
              model: Empresas,
              required: false,
              attributes: ['id'],
              as: 'empresa',
            },
          ],
        },
      ],
    });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener pedidos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener pedidos', detalle: error });
    }
  }
};

exports.getPedidoId = async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const pedido = await Pedidos.findByPk(pedidoId, {
      include: [
        {
          model: PagoPedidos,
          as: 'pagoPedido',
          required: false,
          // attributes: ['id', 'tipoSugerido', 'horarioSugerido'],
        },
        {
          model: Sugerencias,
          required: false,
          attributes: ['id', 'tipoSugerido', 'horarioSugerido'],
        },
        {
          model: Obras,
          required: false,
          attributes: ['id'],
          include: [
            {
              model: Particulares,
              required: false,
              attributes: ['id'],
              as: 'particular',
            },
            {
              model: Empresas,
              required: false,
              attributes: ['id'],
              as: 'empresa',
            },
          ],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Error al obtener pedido', detalle: 'Pedido no existe' });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener pedido', detalle: error });
    }
  }
};

const crearMovimiento = async (req, res, tipo) => {
  const { pedidoId, choferId, horario, numeroVolqueta } = req.body;

  if (!choferId) throw new Error('Movimiento debe tener Chofer');
  if (!pedidoId) throw new Error('Movimiento debe tener Pedido');
  if (!horario) throw new Error('Movimiento debe tener horario');

  const pedido = await Pedidos.findByPk(pedidoId, {
    include: [Movimientos],
  });

  if (pedido) {
    const numMovimientos = pedido.Movimientos.length;
    if (tipo === 'entrega' && numMovimientos !== 0) {
      throw new Error('Para crear la entrega el pedido no debe tener movimientos');
    } else if (tipo === 'levante' && numMovimientos !== 1) {
      throw new Error('Para crear el levante el pedido debe tener 1 movimiento(Entrega)');
    }
  } else {
    throw new Error('Pedido no existe');
  }
  const nuevoMovimiento = await Movimientos.create({ pedidoId, choferId, horario, tipo, numeroVolqueta });
  return nuevoMovimiento;
};

exports.nuevaEntrega = async (req, res) => {
  const { pedidoId } = req.params;
  try {
    const movimiento = await crearMovimiento(req, res, 'entrega');

    const pedido = await Pedidos.findByPk(pedidoId);
    pedido.estado = 'entregado';
    pedido.save();

    res.status(201).json(movimiento);
  } catch (error) {
    console.error('Error al crear el movimiento:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el movimiento', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el movimiento', detalle: error.message });
    }
  }
};
