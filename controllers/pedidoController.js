const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados } = require('../models');
const validator = require('validator'); // Usamos validator para validaciones y sanitización

const crearPedido = async (req, res, creadoComo) => {
  const creadoPor = req.user.id;
  const {
    obraId,
    descripcion,
    permisoId,
    referenciaId,
    cantidadMultiple,
    // estado,
    // nroPesada,

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
    // numeroVolqueta,
    // fecha,
    // horario,
    // tipo,
    // choferId,
  } = req.body;

  // ---------------------------- Validaciones ----------------------------
  //validar multiple
  if (creadoComo === 'multiple' && cantidadMultiple < 2) throw new Error('Para crear un pedido multiple debe seleccionar como minimo dos pedidos');
  if (creadoComo === 'multiple' && !cantidadMultiple) throw new Error('Para crear un pedido multiple debe seleccionar como minimo dos pedidos');
  //validar recambio
  if (creadoComo === 'recambio' && !referenciaId) throw new Error('Para crear un pedido como recambio debe seleccionar un pedido anterior');

  if (precio && !validator.isFloat(precio.toString())) throw new Error('El campo precio debe ser un número válido.');
  if (!obraId || !validator.isInt(obraId.toString())) throw new Error('Debe tener una obra y debe ser valida');
  if (tipoPago && !['credito', 'debito', 'efectivo', 'cheque', 'otros'].includes(tipoPago)) {
    throw new Error("Tipo de pago debe ser valido, opciones: ('credito', 'debito', 'efectivo', 'cheque', 'otros')");
  }
  if (horarioSugerido && isNaN(Date.parse(horarioSugerido))) throw new Error('Horario sugerido debe ser una fecha válida');
  if (horarioSugerido && Date.parse(horarioSugerido) < Date.now()) throw new Error('Horario sugerido debe ser una fecha válida en el futuro');

  //validar Obra
  const obra = await Obras.findByPk(obraId);
  if (!obra) throw new Error('Debe tener una obra y debe ser valida');
  if (!obra.activa) throw new Error('Obra no esta activa');

  //validar Permiso
  if (permisoId) {
    const permiso = await Permisos.findByPk(permisoId);
    if (!permiso) throw new Error('Permiso no valido');
    if (permiso.fechaVencimiento < Date.now()) throw new Error('Permiso Vencido, puede dejar este campo en blanco y agregar un permiso luego');
    if (obra.particularId === null && obra.empresaId !== permiso.empresaId) throw new Error('Obra y Permiso tienen diferente Empresa vinculada');
  }

  //validar Recambio
  if (referenciaId) {
    const pedidoAnterior = await Pedidos.findByPk(referenciaId);
    if (!pedidoAnterior) throw new Error('Pedido anterior no existe');
    const obra = await pedidoAnterior.getObra();
    if (obra.id !== obraId) throw new Error('El nuevo pedido debe tener misma obra que el pedido anterior');
  }

  //validar Chofer
  if (choferSugeridoId) {
    const choferSugerido = await Empleados.findByPk(choferSugeridoId);
    if (!choferSugerido || !choferSugerido.habilitado) throw new Error('Id de Chofer sugerido no es valido');
    if (!choferSugerido.habilitado) throw new Error('Id de Chofer sugerido no es valido, No esta habilitado');
    if (choferSugerido.rol !== 'chofer') throw new Error('Id de Chofer sugerido no es valido, Empleado no es chofer');
  }

  const nuevoPago = await PagoPedidos.create({
    precio,
    pagado,
    tipoPago,
  });

  const pedido = { creadoPor, obraId, descripcion, estado: 'iniciado', creadoComo, permisoId, pagoPedidoId: nuevoPago.id };
  const nuevoPedido = await Pedidos.create(pedido);
  const nuevaSugerencia = await Sugerencias.create({
    pedidoId: nuevoPedido.id,
    horarioSugerido,
    tipoSugerido: 'entrega',
    choferSugeridoId,
  });

  if (creadoComo === 'recambio') {
    nuevoPedido.referenciaId = referenciaId;
    nuevoPedido.save();
  } else if (creadoComo === 'multiple') {
    nuevoPedido.referenciaId = nuevoPedido.id;
    nuevoPedido.save();
    const multiples = [];

    for (let i = 1; i < cantidadMultiple; i++) {
      pedido.referenciaId = nuevoPedido.id;
      pedido.pagoPedidoId = nuevoPago.id;
      multiples.push(pedido);
    }

    const pedidosMultiples = await Pedidos.bulkCreate(multiples);
    pedidosMultiples.push(nuevoPedido);
    console.log(pedidosMultiples);
    return pedidosMultiples;
  }

  return { nuevaSugerencia, nuevoPedido, nuevoPago };
};

// Controlador para crear un pedido
exports.createPedidoNuevo = async (req, res) => {
  try {
    let nuevoPedidoYSugerencia;
    if (req.path === '/pedidos/entrega-levante') {
      nuevoPedidoYSugerencia = await crearPedido(req, res, 'entrega mas levante');
    } else if (req.path === '/pedidos/recambio') {
      nuevoPedidoYSugerencia = await crearPedido(req, res, 'recambio');
    } else {
      nuevoPedidoYSugerencia = await crearPedido(req, res, 'nuevo');
    }

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

exports.createPedidoMultiple = async (req, res) => {
  try {
    const nuevoPedidoYSugerencia = await crearPedido(req, res, 'multiple');

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
