const { Pedidos, Movimientos, Sugerencias } = require('../models');
const validator = require('validator'); // Usamos validator para validaciones y sanitización

const crearPedido = async (req, res, creadoComo) => {
  const creadoPor = req.user.id;
  const {
    obraId,
    descripcion,
    // estado,
    permisoId,
    // nroPesada,
    precio,
    pagado,
    // remito,
    referenciaId,
    cantidadMultiple,
    //SUGERENCIA
    horarioSugerido,
    // tipoSugerido,
    choferSugerido,
    //MOVIMIENTO
    numeroVolqueta,
    fecha,
    horario,
    tipo,
    choferId,
  } = req.body;

  // Validaciones
  if (precio && !validator.isFloat(precio.toString())) return res.status(400).json({ error: 'El campo precio debe ser un número válido.' });
  //   if (rut && !validator.isLength(rut, { min: 12, max: 12 })) return res.status(400).json({ error: 'El RUT debe tener 12 caracteres.' });
  if (!obraId || !validator.isInt(obraId.toString())) return res.status(400).json({ error: 'Debe tener una obra y debe ser valida' });
  if (precio && !validator.isFloat(precio.toString())) return res.status(400).json({ error: 'Precio debe ser valido' });

  const pedido = { creadoPor, obraId, descripcion, estado: 'iniciado', creadoComo, permisoId, precio, pagado };
  const nuevoPedido = await Pedidos.create(pedido);

  if (creadoComo === 'nuevo') {
  } else if (creadoComo === 'recambio') {
    nuevoPedido.referenciaId = referenciaId;
    nuevoPedido.save();
    // const nuevoMovimiento = await Movimientos.create({ pedidoId: nuevoPedido.id });
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
    choferSugerido,
  });
  console.log(nuevaSugerencia, nuevoPedido);
  return nuevoPedido;
};

// Controlador para crear un pedido
exports.createPedidoNuevo = async (req, res) => {
  //   const { obraId, descripcion, estado, creadoComo, permisoId, nroPesada, precio, pagado, remito, referenciaId, horarioSugerido, tipo, pedidoId } = req.body;

  //   const creadoPor = req.user.id;
  try {
    const nuevoPedido = await crearPedido(req, res, 'nuevo');

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido', detalle: error.message });
  }
};

exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedidos.findAll();
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
