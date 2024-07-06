const { where } = require('sequelize');
const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados, Volquetas } = require('../models');
const validator = require('validator'); // Usamos validator para validaciones y sanitización

const validarPedido = async (req, creadoComo) => {
  const {
    obraId,
    permisoId,
    referenciaId,
    cantidadMultiple,
    //PAGOPEDIDOS -------------
    precio,
    tipoPago,
    //SUGERENCIA -------------
    horarioSugerido,
    choferSugeridoId,
  } = req.body;
  // ---------------------------- Validaciones ----------------------------
  //validar multiple
  if (creadoComo === 'multiple') {
    if (cantidadMultiple < 2 || !cantidadMultiple) {
      throw new Error('Para crear un pedido multiple debe seleccionar como mínimo dos pedidos');
    }
  }
  //validar recambio
  if (creadoComo === 'recambio' && !referenciaId) {
    throw new Error('Para crear un pedido como recambio debe seleccionar un pedido anterior');
  }

  if (precio && !validator.isFloat(precio.toString())) {
    throw new Error('El campo precio debe ser un número válido.');
  }
  if (!obraId || !validator.isInt(obraId.toString())) {
    throw new Error('Debe tener una obra y debe ser valida');
  }
  if (tipoPago && !['transferencia', 'efectivo', 'cheque'].includes(tipoPago)) {
    throw new Error("Tipo de pago debe ser válido, opciones: ('transferencia', 'efectivo', 'cheque')");
  }
  if (horarioSugerido && isNaN(Date.parse(horarioSugerido))) {
    throw new Error('Horario sugerido debe ser una fecha válida');
  }
  if (horarioSugerido && Date.parse(horarioSugerido) < Date.now()) {
    throw new Error('Horario sugerido debe ser una fecha válida en el futuro');
  }

  //validar Obra
  const obra = await Obras.findByPk(obraId);
  if (!obra) throw new Error('Debe tener una obra y debe ser válida');
  if (!obra.activa) throw new Error('Obra no esta activa');

  //validar Permiso
  if (permisoId) {
    const permiso = await Permisos.findByPk(permisoId);
    if (!permiso) throw new Error('Permiso no válido');
    if (permiso.fechaVencimiento < Date.now()) throw new Error('Permiso Vencido, puede dejar este campo en blanco y agregar un permiso luego');
    if (obra.particularId !== null) {
      //si la obra es de un particular
      const volketas10 = await Empresas.findOne({ where: { nombre: 'Volketas 10' } });
      if (permiso.empresaId !== volketas10.id) throw new Error('El Permiso de un particular, debe ser el vigente de Volketas 10');
    } else {
      //si la obra es de una empresa
      if (obra.empresaId !== permiso.empresaId) throw new Error('Obra y Permiso tienen diferente Empresa vinculada');
    }
  }

  //validar Recambio
  if (referenciaId) {
    const pedidoAnterior = await Pedidos.findByPk(referenciaId);
    if (!pedidoAnterior) throw new Error('Pedido anterior no existe');
    if (pedidoAnterior.obraId !== obraId) throw new Error('El nuevo pedido debe tener misma obra que el pedido anterior');
  }

  //validar Chofer
  if (choferSugeridoId) {
    const choferSugerido = await Empleados.findByPk(choferSugeridoId);
    if (!choferSugerido || !choferSugerido.habilitado) throw new Error('Id de Chofer sugerido no es válido');
    if (choferSugerido.rol !== 'chofer') throw new Error('Id de Chofer sugerido no es válido, Empleado no es chofer');
  }
  return obra;
};

const crearPedido = async (req, creadoComo) => {
  const creadoPor = req.user.id;
  const {
    obraId,
    descripcion,
    permisoId,
    referenciaId,
    cantidadMultiple,
    //PAGOPEDIDOS -------------
    precio,
    pagado,
    tipoPago,
    //SUGERENCIA -------------
    horarioSugerido,
    choferSugeridoId,
  } = req.body;

  const obra = await validarPedido(req, creadoComo);

  const nuevoPago = await PagoPedidos.create({
    precio,
    pagado,
    tipoPago,
  });

  const pedido = { creadoPor, obraId, descripcion, estado: 'iniciado', creadoComo, permisoId, pagoPedidoId: nuevoPago.id };
  const nuevoPedido = await Pedidos.create(pedido);

  let nuevaSugerencia;
  let sugerencia;
  if (horarioSugerido || choferSugeridoId) {
    sugerencia = { pedidoId: nuevoPedido.id, horarioSugerido, tipoSugerido: 'entrega', choferSugeridoId };
    nuevaSugerencia = await Sugerencias.create(sugerencia);
  }

  if (creadoComo === 'recambio') {
    nuevoPedido.referenciaId = referenciaId;
    nuevoPedido.save();
  } else if (creadoComo === 'multiple') {
    nuevoPedido.referenciaId = nuevoPedido.id;
    const obraLugar = obra.calle;
    nuevoPedido.descripcion = `Pedido Multiple Nro 1 en ${obraLugar}: ${descripcion} `;
    nuevoPedido.save();
    let multiples = [];

    for (let i = 1; i < cantidadMultiple; i++) {
      const pedidoIteracion = {
        ...pedido,
        referenciaId: nuevoPedido.id,
        pagoPedidoId: nuevoPago.id,
        descripcion: `Pedido Multiple Nro ${i + 1} en ${obraLugar}: ${descripcion}`,
      };
      multiples.push(pedidoIteracion);
    }

    const pedidosMultiples = await Pedidos.bulkCreate(multiples);

    for (let i = 1; i < cantidadMultiple; i++) {
      sugerencia.pedidoId = pedidosMultiples[i - 1].id;
      await Sugerencias.create(sugerencia);
    }
    pedidosMultiples.push(nuevoPedido);
    return pedidosMultiples;
  }

  return { nuevaSugerencia, nuevoPedido, nuevoPago };
};

exports.createPedidoNuevo = async (req, res) => {
  try {
    let nuevoPedidoYSugerencia;
    if (req.path === '/pedidos/entrega-levante') {
      nuevoPedidoYSugerencia = await crearPedido(req, 'entrega mas levante');
    } else if (req.path === '/pedidos/recambio') {
      nuevoPedidoYSugerencia = await crearPedido(req, 'recambio');
    } else {
      nuevoPedidoYSugerencia = await crearPedido(req, 'nuevo');
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
    const nuevoPedidoYSugerencia = await crearPedido(req, 'multiple');
    res.status(201).json(nuevoPedidoYSugerencia);
  } catch (error) {
    console.error('Error al crear los pedidos:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear los pedidos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear los pedidos', detalle: error.message });
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
          model: Movimientos,
          required: false,
          // attributes: ['id', 'horario', 'tipo', 'choferId'],
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

const validarMovimiento = async (req, pedido, volqueta) => {
  const { pedidoId, choferId, horario, numeroVolqueta, tipo } = req.body;

  if (!(tipo === 'entrega' || tipo === 'levante')) {
    return res.status(400).json({ error: 'Tipo solo puede ser "entrega" o "levante"' });
  }
  if (!choferId) throw new Error('Movimiento debe tener Chofer');
  if (!pedidoId) throw new Error('Movimiento debe tener Pedido');
  if (!horario) throw new Error('Movimiento debe tener horario');
  if (!volqueta && numeroVolqueta) throw new Error('Volqueta no existe');

  if (pedido) {
    const numMovimientos = pedido.Movimientos.length;
    if (tipo === 'entrega') {
      if (numMovimientos !== 0) throw new Error('Para crear la entrega el pedido no debe tener movimientos');
      if (volqueta && volqueta.ocupada) throw new Error('Volqueta esta siendo utilizada en otro lugar');
    } else if (tipo === 'levante') {
      if (numMovimientos !== 1) throw new Error('Para crear el levante el pedido debe tener 1 movimiento(Entrega)');
      if (pedido.Movimientos[0].numeroVolqueta) {
        if (pedido.Movimientos[0].numeroVolqueta !== numeroVolqueta) throw new Error('Volqueta del levante debe ser la misma que la de la entrega');
      } else {
        if (numeroVolqueta) throw new Error('Para asignar volqueta al levante, la entrega debe tener una');
      }
    }
  } else {
    throw new Error('Pedido no existe');
  }
};

exports.nuevoMovimiento = async (req, res) => {
  const { pedidoId, tipo, numeroVolqueta } = req.body;
  try {
    const pedido = await Pedidos.findByPk(pedidoId, { include: [Movimientos] });
    const volqueta = await Volquetas.findByPk(numeroVolqueta);

    await validarMovimiento(req, pedido, volqueta);
    const nuevoMovimiento = await Movimientos.create({ ...req.body });

    if (tipo === 'entrega') {
      pedido.estado = 'entregado';
      if (volqueta) volqueta.ocupada = true;
    } else {
      pedido.estado = 'levantado';
      if (volqueta) volqueta.ocupada = false;
    }

    pedido.save();
    if (volqueta) volqueta.save(); //To do: hacer el movimiento doble(entrega y levante a la misma vez)

    res.status(201).json(nuevoMovimiento);
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
