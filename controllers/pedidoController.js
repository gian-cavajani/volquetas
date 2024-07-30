const { Op } = require('sequelize');
const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados } = require('../models');
const validator = require('validator');

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
  if (!['transferencia', 'efectivo', 'cheque'].includes(tipoPago)) {
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
      let chequeo = 0;
      if (permiso.particularId === obra.particularId) chequeo += 1;
      if (permiso.empresaId === volketas10.id) chequeo += 1;
      if (chequeo === 0) throw new Error('El permiso debe pertenecer al cliente particular o ser el vigente de Volketas 10');
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
    await nuevoPedido.save();
  } else if (creadoComo === 'multiple') {
    nuevoPedido.referenciaId = nuevoPedido.id;
    const obraLugar = obra.calle;
    nuevoPedido.descripcion = `Pedido Multiple Nro 1 en ${obraLugar}: ${descripcion} `;
    await nuevoPedido.save();
    let multiples = [];

    for (let i = 1; i < cantidadMultiple; i++) {
      const pagoPedidoIteracion = await PagoPedidos.create({
        precio,
        pagado,
        tipoPago,
      });
      const pedidoIteracion = {
        ...pedido,
        referenciaId: nuevoPedido.id,
        pagoPedidoId: pagoPedidoIteracion.id,
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
      res.status(500).json({ error: 'Error al crear el pedido', detalle: error.message, stack: error.stack.message });
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
      res.status(500).json({ error: 'Error al crear los pedidos', detalle: error.message, stack: error.stack.message });
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
      res.status(500).json({ error: 'Error al obtener pedidos', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getPedidosMultiples = async (req, res) => {
  const pedidoId = req.params.pedidoId;
  try {
    const pedidoBaseId = await Pedidos.findByPk(pedidoId, { attributes: ['id', 'referenciaId', 'creadoComo'] });
    if (!pedidoBaseId || pedidoBaseId.creadoComo !== 'multiple' || !pedidoBaseId.referenciaId) {
      return res.status(400).json({ error: 'Id de pedido incorrecto, pedido debe existir y ser multiple' });
    }

    const pedidoMatriz = await Pedidos.findByPk(pedidoBaseId.referenciaId, { attributes: ['id', 'creadoComo'] });
    if (pedidoMatriz.creadoComo !== 'multiple') {
      return res.status(400).json({ error: 'Pedido Matriz debe ser multiple' });
    }

    const idPedidos = await Pedidos.findAll({ where: { referenciaId: pedidoMatriz.id, creadoComo: 'multiple' }, attributes: ['id', 'estado'] });

    res.status(200).json(idPedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener pedidos multiples', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener pedidos multiples', detalle: error.message, stack: error.stack.toString() });
    }
  }
};

exports.getPedidosConFiltro = async (req, res) => {
  const { ultimos, estado, pagado, fechaInicio, fechaFin, empresaId, particularId, tipoHorario, obraId, choferId, choferSugeridoId } = req.query;

  let whereClause = {};
  let pagoWhereClause = {};
  let sugerenciaWhereClause = {};
  let movimientoWhereClause = {};
  let obraWhereClause = {};

  if (ultimos) {
    if (ultimos > 50) return res.status(400).json({ error: 'No se pueden traer mas de 50 Pedidos a la vez' });
  }
  if (!['movimientoEntrega', 'movimientoLevante', 'sugerenciaEntrega', 'sugerenciaLevante', 'creacion'].includes(tipoHorario)) {
    return res.status(400).json({ error: "Los tipos de horario solo pueden ser: ('movimientoEntrega', 'movimientoLevante', 'sugerenciaEntrega', 'sugerenciaLevante', 'creacion')" });
  }

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });
    if (tipoHorario === 'sugerenciaEntrega') {
      sugerenciaWhereClause.horarioSugerido = { [Op.between]: [fechaInicio, fechaFin] };
      sugerenciaWhereClause.tipoSugerido = 'entrega';
    } else if (tipoHorario === 'sugerenciaLevante') {
      sugerenciaWhereClause.horarioSugerido = { [Op.between]: [fechaInicio, fechaFin] };
      sugerenciaWhereClause.tipoSugerido = 'levante';
    } else if (tipoHorario === 'movimientoEntrega') {
      movimientoWhereClause.horario = { [Op.between]: [fechaInicio, fechaFin] };
      movimientoWhereClause.tipo = 'entrega';
    } else if (tipoHorario === 'movimientoLevante') {
      movimientoWhereClause.horario = { [Op.between]: [fechaInicio, fechaFin] };
      movimientoWhereClause.tipo = 'levante';
    } else if (tipoHorario === 'creacion') {
      whereClause.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
    }
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  if (estado) {
    if (!['cancelado', 'iniciado', 'entregado', 'levantado'].includes(estado)) {
      return res.status(400).json({ error: "Los tipos de estado de pedidos solo pueden ser: ('cancelado', 'iniciado', 'entregado', 'levantado')" });
    }
    whereClause.estado = estado;
  }

  if (pagado !== undefined) pagoWhereClause.pagado = pagado === 'true';
  if (obraId) obraWhereClause.id = obraId;
  if (empresaId) obraWhereClause.empresaId = empresaId;
  if (particularId) obraWhereClause.particularId = particularId;
  if (choferId) movimientoWhereClause.choferId = choferId;
  if (choferSugeridoId) sugerenciaWhereClause.choferSugeridoId = choferSugeridoId;

  let objPago = { model: PagoPedidos, as: 'pagoPedido', attributes: [] };
  let objSugerencia = { model: Sugerencias, attributes: [] };
  let objMovimiento = { model: Movimientos, attributes: [] };
  let objObra = { model: Obras, attributes: [] };
  if (Object.keys(pagoWhereClause).length !== 0) objPago.where = pagoWhereClause;
  if (Object.keys(sugerenciaWhereClause).length !== 0) objSugerencia.where = sugerenciaWhereClause;
  if (Object.keys(movimientoWhereClause).length !== 0) objMovimiento.where = movimientoWhereClause;
  if (Object.keys(obraWhereClause).length !== 0) objObra.where = obraWhereClause;

  try {
    const idPedidos = await Pedidos.findAll({
      order: [['createdAt', 'DESC']],
      limit: ultimos ? ultimos : 50,
      where: whereClause,
      attributes: ['id', 'createdAt'],
      include: [objPago, objSugerencia, objMovimiento, objObra],
    });
    if (idPedidos.length === 0) return res.json(idPedidos);

    const pedidos = await Pedidos.findAll({
      order: [['createdAt', 'DESC']],
      where: { id: { [Op.in]: idPedidos.map((p) => p.id) } },
      attributes: ['id', 'createdAt', 'descripcion', 'estado', 'creadoComo'],
      include: [
        {
          model: PagoPedidos,
          as: 'pagoPedido',
          attributes: ['id', 'precio', 'pagado'],
        },
        {
          model: Obras,
          attributes: ['id', 'calle', 'esquina', 'numeroPuerta'],
          include: [
            { model: Particulares, as: 'particular', required: false, attributes: ['id', 'nombre'] },
            { model: Empresas, as: 'empresa', required: false, attributes: ['id', 'nombre'] },
          ],
        },
        { model: Movimientos, attributes: ['id', 'tipo', 'horario', 'choferId'] },
        { model: Sugerencias, attributes: ['id', 'tipoSugerido', 'horarioSugerido', 'choferSugeridoId'] },
      ],
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener pedido', detalle: error.message, stack: error.stack });
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
          // attributes: ['id', 'tipoSugerido', 'horarioSugerido'],
        },
        {
          model: Movimientos,
          required: false,
          // attributes: ['id', 'horario', 'tipo', 'choferId'],
        },
        {
          model: Obras,
          required: false,
          attributes: ['id', 'calle', 'esquina', 'barrio', 'numeroPuerta', 'descripcion'],
          include: [
            {
              model: Particulares,
              required: false,
              attributes: ['id', 'nombre'],
              as: 'particular',
            },
            {
              model: Empresas,
              required: false,
              attributes: ['id', 'nombre'],
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
      res.status(500).json({ error: 'Error al obtener pedido', detalle: error.message, stack: error.stack });
    }
  }
};

exports.modificarPedido = async (req, res) => {
  const { pedidoId } = req.params;
  const { descripcion, nroPesada, obraId } = req.body;
  try {
    const pedido = await Pedidos.findByPk(pedidoId);
    if (!pedido) return res.status(404).json({ error: 'Pedido no existe' });

    if (obraId) {
      const obra = await Obras.findByPk(obraId);
      if (!obra) return res.status(400).json({ error: 'Obra no existe' });
      if (!obra.activa) return res.status(400).json({ error: 'Obra no esta activa' });

      if (pedido.permisoId) {
        const permiso = await Permisos.findByPk(pedido.permisoId);
        if (obra.particularId !== null) {
          //si la obra es de un particular
          let val = 0;
          const volketas10 = await Empresas.findOne({ where: { nombre: 'Volketas 10' } });
          if (obra.particularId === permiso.particularId) val = 1;
          if (permiso.empresaId === volketas10.id) val = 1;
          if (val === 0) return res.status(400).json({ error: 'Obra y Permiso tienen diferente Cliente vinculado, El permiso puede ser el vigente de Volketas 10 o propio del particular' });
        } else {
          //si la obra es de una empresa
          if (permiso.particularId !== null) return res.status(400).json({ error: 'Obra y Permiso tienen diferente Cliente vinculado' });
          if (obra.empresaId !== permiso.empresaId) return res.status(400).json({ error: 'Obra y Permiso tienen diferente Empresa vinculada' });
        }
      }
      pedido.obraId = obraId;
      await pedido.save();
    }

    pedido.descripcion = descripcion ? descripcion : pedido.descripcion;
    pedido.nroPesada = nroPesada ? nroPesada : pedido.nroPesada;

    await pedido.save();
    res.status(202).json(pedido);
  } catch (error) {
    console.error('Error al modificar el pedido:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];
    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar el pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar el pedido', detalle: error.message, stack: error.stack.message });
    }
  }
};

exports.modificarPermiso = async (req, res) => {
  const { pedidoId } = req.params;
  const { permisoId } = req.body;

  try {
    const pedido = await Pedidos.findByPk(pedidoId);
    if (!pedido) return res.status(404).json({ error: 'Pedido no existe' });

    if (permisoId !== null) {
      const permiso = await Permisos.findByPk(permisoId);

      if (!permiso) return res.status(400).json({ error: 'Permiso no existe' });
      if (permiso.fechaVencimiento < pedido.createdAt) return res.status(400).json({ error: 'Permiso Vencido, antes de la creacion del pedido' });

      const obra = await Obras.findByPk(pedido.obraId);
      if (obra.particularId !== null) {
        //si la obra es de un particular
        let val = 0;
        const volketas10 = await Empresas.findOne({ where: { nombre: 'Volketas 10' } });
        if (obra.particularId === permiso.particularId) val = 1;
        console.log(obra, permiso);
        if (permiso.empresaId === volketas10.id) val = 1;
        if (val === 0) return res.status(400).json({ error: 'Obra y Permiso tienen diferente particular vinculado, El permiso puede ser el vigente de Volketas 10 o propio del particular' });
      } else {
        //si la obra es de una empresa
        if (obra.empresaId !== permiso.empresaId) return res.status(400).json({ error: 'Obra y Permiso tienen diferente Empresa vinculada' });
      }
      pedido.permisoId = permisoId;
    } else {
      pedido.permisoId = null;
    }

    await pedido.save();
    res.status(202).json(pedido);
  } catch (error) {
    console.error('Error al modificar el pedido:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];
    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar el permiso del pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar el permiso del pedido', detalle: error.message, stack: error.stack.message });
    }
  }
};

exports.eliminarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    // Validar si el pedido existe
    const pedido = await Pedidos.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const numMovimientos = await pedido.getCountMovimientos;
    if (numMovimientos > 0) return res.status(400).json({ error: 'Error al eliminar el Pedido, tiene movimientos vinculados' });

    // Eliminar sugerencias vinculadas
    await Sugerencias.destroy({ where: { pedidoId: pedidoId } });

    // Eliminar pagoPedido vinculado
    if (pedido.pagoPedidoId) await PagoPedidos.destroy({ where: { id: pedido.pagoPedidoId } });

    // Eliminar el pedido
    await pedido.destroy();

    res.status(200).json({ detalle: 'Pedido eliminado exitosamente' });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar el pedido', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar el pedido', detalle: error.message, stack: error.stack });
    }
  }
};

//deberia hacer un cancelar pedido?? complica las cosas para el conteo de viajes por empleado
