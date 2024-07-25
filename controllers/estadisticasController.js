const { Op } = require('sequelize');
const { PagoPedidos, Facturas, Pedidos, Obras, Movimientos, Empleados, Particulares, Empresas, Jornales } = require('../models');
const db = require('../config/db');

//Trae movimientos de volqueta de un chofer
exports.countMovimientosPorChofer = async (req, res) => {
  try {
    const { choferId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio) || isNaN(fin)) return res.status(400).json({ error: 'Las fechas no son válidas' });

    if (inicio > fin) return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la de final' });

    // Contar los movimientos de tipo 'entrega'
    const entregasCount = await Movimientos.count({
      where: {
        choferId,
        tipo: 'entrega',
        horario: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    // Contar los movimientos de tipo 'levante'
    const levantesCount = await Movimientos.count({
      where: {
        choferId,
        tipo: 'levante',
        horario: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    const pedidos = await Pedidos.findAll({
      attributes: ['id'],
      include: [
        {
          model: Movimientos,
          required: true,
          attributes: ['id', 'tipo', 'horario', 'choferId'],
          where: {
            choferId,
            horario: {
              [Op.between]: [fechaInicio, fechaFin],
            },
          },
        },
        // { model: PagoPedidos, as: 'pagoPedido' },
      ],
    });

    // Calcular el total de movimientos
    const totalCount = entregasCount + levantesCount;

    const datos = await Jornales.findAll({
      where: {
        empleadoId: choferId,
        fecha: { [Op.and]: [{ [Op.gte]: fechaInicio }, { [Op.lte]: fechaFin }] },
      },
      attributes: [
        'empleadoId',
        [db.fn('COUNT', db.col('id')), 'registros'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN 1 ELSE 0 END`)), 'diasTrabajo'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'licencia' THEN 1 ELSE 0 END`)), 'diasLicencia'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'enfermedad' THEN 1 ELSE 0 END`)), 'diasEnfermedad'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'falta' THEN 1 ELSE 0 END`)), 'diasFalta'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN EXTRACT(EPOCH FROM (salida - entrada)) / 3600 ELSE 0 END`)), 'horasTrabajadas'],
        [db.fn('SUM', db.col('horasExtra')), 'horasExtra'],
      ],

      group: ['empleadoId'],
      raw: true,
    });

    res.status(200).json({
      entregas: entregasCount,
      levantes: levantesCount,
      total: totalCount,
      pedidos,
      datos,
    });
    // res.status(200).json(movimientos, totalCount);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al contar los movimientos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al contar los movimientos', detalle: error });
    }
  }
};

//Trae movimientos de volqueta de todos los choferes
exports.countMovimientosChoferesActivos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio) || isNaN(fin)) {
      return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas' });
    }
    if (inicio > fin) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la de final' });
    }

    const choferesActivos = await Empleados.findAll({
      where: {
        habilitado: true,
        rol: 'chofer',
      },
      attributes: ['id'],
    });

    const choferIds = choferesActivos.map((chofer) => chofer.id);

    const movimientos = await Movimientos.findAll({
      where: {
        choferId: {
          [Op.in]: choferIds,
        },
        horario: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: ['choferId', 'tipo'],
    });

    // Contar los movimientos por chofer
    const movimientosPorChofer = movimientos.reduce((acc, movimiento) => {
      const { choferId, tipo } = movimiento;
      if (!acc[choferId]) {
        acc[choferId] = { choferId, entregas: 0, levantes: 0, total: 0 };
      }
      if (tipo === 'entrega') {
        acc[choferId].entregas += 1;
      } else if (tipo === 'levante') {
        acc[choferId].levantes += 1;
      }
      acc[choferId].total += 1;
      return acc;
    }, {});

    const resultado = Object.values(movimientosPorChofer);

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al contar los movimientos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al contar los movimientos', detalle: error });
    }
  }
};

//Trae la info de un cliente especifico y sus pedidos
exports.getInfoPedidosCliente = async (req, res) => {
  const { estado, fechaInicio, fechaFin, empresaId, particularId } = req.query;

  let whereClause = {};
  let obraWhereClause = {};

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });

    whereClause.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  if ((empresaId && particularId) || (!empresaId && !particularId)) {
    return res.status(400).json({ error: 'Debe ingresar una empresa o un particular unicamente' });
  }

  if (estado) {
    if (!['cancelado', 'iniciado', 'entregado', 'levantado'].includes(estado)) {
      return res.status(400).json({ error: "Los tipos de estado de pedidos solo pueden ser: ('cancelado', 'iniciado', 'entregado', 'levantado')" });
    }
    whereClause.estado = estado;
  }

  if (empresaId) obraWhereClause.empresaId = empresaId;
  if (particularId) obraWhereClause.particularId = particularId;

  let objPago = { model: PagoPedidos, as: 'pagoPedido', attributes: ['id', 'pagado', 'precio'] };
  let objObra = { model: Obras, attributes: ['id', 'empresaId', 'particularId'] };
  if (Object.keys(obraWhereClause).length !== 0) objObra.where = obraWhereClause;

  try {
    const pedidos = await Pedidos.findAll({
      order: [['createdAt', 'ASC']],
      where: whereClause,
      attributes: ['id', 'createdAt', 'estado'],
      include: [objPago, objObra],
    });
    let resumen = {
      total: 0,
      pagados: { cantidad: 0, monto: 0, ids: [] },
      nopagados: { cantidad: 0, monto: 0, ids: [] },
      estado: {
        levantado: { cantidad: 0, ids: [] },
        entregado: { cantidad: 0, ids: [] },
        iniciado: { cantidad: 0, ids: [] },
        cancelado: { cantidad: 0, ids: [] },
      },
      obras: {},
    };

    pedidos.forEach((pedido) => {
      resumen.total += 1;

      if (pedido.pagoPedido.pagado) {
        resumen.pagados.cantidad += 1;
        resumen.pagados.monto += pedido.pagoPedido.precio;
        resumen.pagados.ids.push(pedido.id);
      } else {
        resumen.nopagados.cantidad += 1;
        resumen.nopagados.monto += pedido.pagoPedido.precio;
        resumen.nopagados.ids.push(pedido.id);
      }

      if (resumen.estado[pedido.estado] !== undefined) {
        resumen.estado[pedido.estado].cantidad += 1;
        resumen.estado[pedido.estado].ids.push(pedido.id);
      }

      const obraId = pedido.Obra.id;
      if (resumen.obras[obraId]) {
        resumen.obras[obraId].cantidad += 1;
        resumen.obras[obraId].ids.push(pedido.id);
      } else {
        resumen.obras[obraId] = { cantidad: 1, ids: [pedido.id] };
      }
    });

    res.json(resumen);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener estadisticas del cliente', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener estadisticas del cliente', detalle: error });
    }
  }
};

const getResumen = async (whereClause) => {
  try {
    const pedidos = await Pedidos.findAll({
      order: [['createdAt', 'ASC']],
      where: whereClause,
      attributes: ['id', 'createdAt', 'estado'],
      include: [
        { model: PagoPedidos, as: 'pagoPedido', attributes: ['id', 'pagado', 'precio'] },
        { model: Obras, attributes: ['id', 'empresaId', 'particularId'] },
      ],
    });

    let resumen = {
      total: 0,
      pagados: { cantidad: 0, monto: 0 },
      nopagados: { cantidad: 0, monto: 0 },
      estado: {
        levantado: { cantidad: 0 },
        entregado: { cantidad: 0 },
        iniciado: { cantidad: 0 },
        cancelado: { cantidad: 0 },
      },
      empresas: {},
      particulares: {},
    };

    pedidos.forEach((pedido) => {
      resumen.total += 1;

      if (pedido.pagoPedido.pagado) {
        resumen.pagados.cantidad += 1;
        resumen.pagados.monto += pedido.pagoPedido.precio;
      } else {
        resumen.nopagados.cantidad += 1;
        resumen.nopagados.monto += pedido.pagoPedido.precio;
      }

      if (resumen.estado[pedido.estado] !== undefined) {
        resumen.estado[pedido.estado].cantidad += 1;
      }

      // Manejando empresas
      if (pedido.Obra.empresaId) {
        const empresaId = pedido.Obra.empresaId;
        if (!resumen.empresas[empresaId]) {
          resumen.empresas[empresaId] = {
            pagados: { cantidad: 0, monto: 0 },
            nopagados: { cantidad: 0, monto: 0 },
          };
        }
        if (pedido.pagoPedido.pagado) {
          resumen.empresas[empresaId].pagados.cantidad += 1;
          resumen.empresas[empresaId].pagados.monto += pedido.pagoPedido.precio;
        } else {
          resumen.empresas[empresaId].nopagados.cantidad += 1;
          resumen.empresas[empresaId].nopagados.monto += pedido.pagoPedido.precio;
        }
      }

      // Manejando particulares
      if (pedido.Obra.particularId) {
        const particularId = pedido.Obra.particularId;
        if (!resumen.particulares[particularId]) {
          resumen.particulares[particularId] = {
            pagados: { cantidad: 0, monto: 0 },
            nopagados: { cantidad: 0, monto: 0 },
          };
        }
        if (pedido.pagoPedido.pagado) {
          resumen.particulares[particularId].pagados.cantidad += 1;
          resumen.particulares[particularId].pagados.monto += pedido.pagoPedido.precio;
        } else {
          resumen.particulares[particularId].nopagados.cantidad += 1;
          resumen.particulares[particularId].nopagados.monto += pedido.pagoPedido.precio;
        }
      }
    });

    return resumen;
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      return res.status(500).json({ error: 'Error al obtener estadisticas', detalle: errorsSequelize });
    } else {
      return res.status(500).json({ error: 'Error al obtener estadisticas', detalle: error });
    }
  }
};

//Trae la info de los clientes y sus pedidos
exports.getInfoPedidosClientes = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  let whereClause = {};

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });

    whereClause.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  try {
    const resumen = await getResumen(whereClause);
    delete resumen.total;
    delete resumen.pagados;
    delete resumen.nopagados;
    delete resumen.estado;
    return res.status(200).json(resumen);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: error });
    }
  }
};

//Trae la info general de los pedidos
exports.getInfoPedidos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  let whereClause = {};

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });

    whereClause.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  try {
    const resumen = await getResumen(whereClause);
    delete resumen.empresas;
    delete resumen.particulares;
    return res.status(200).json(resumen);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: error });
    }
  }
};

//Trae la info de los mayores deudores
exports.getInfoMayoresDeudores = async (req, res) => {
  const { fechaInicio, fechaFin, tipo, deudores } = req.query;

  if (deudores < 1 || !deudores) return res.status(400).json({ error: 'Cantidad de deudores debe ser mayor a 0' });
  if (!['cantidad', 'monto'].includes(tipo) || !tipo) return res.status(400).json({ error: 'Tipo de deuda debe ser por cantidad o por monto' });
  let whereClause = {};

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });

    whereClause.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  try {
    const resumen = await getResumen(whereClause);

    let empresasArray;
    let particularesArray;
    if (tipo === 'cantidad') {
      // Obtener el top de clientes con más pedidos no pagados
      empresasArray = Object.entries(resumen.empresas)
        .filter(([id, data]) => data.nopagados.cantidad > 0)
        .sort((a, b) => b[1].nopagados.cantidad - a[1].nopagados.cantidad)
        .slice(0, deudores)
        .map(([id, data]) => ({ id, ...data.nopagados }));

      particularesArray = Object.entries(resumen.particulares)
        .filter(([id, data]) => data.nopagados.cantidad > 0)
        .sort((a, b) => b[1].nopagados.cantidad - a[1].nopagados.cantidad)
        .slice(0, deudores)
        .map(([id, data]) => ({ id, ...data.nopagados }));
    } else {
      // Obtener el top de clientes con más deuda neta
      empresasArray = Object.entries(resumen.empresas)
        .filter(([id, data]) => data.nopagados.monto > 0)
        .sort((a, b) => b[1].nopagados.monto - a[1].nopagados.monto)
        .slice(0, deudores)
        .map(([id, data]) => ({ id, ...data.nopagados }));

      particularesArray = Object.entries(resumen.particulares)
        .filter(([id, data]) => data.nopagados.monto > 0)
        .sort((a, b) => b[1].nopagados.monto - a[1].nopagados.monto)
        .slice(0, deudores)
        .map(([id, data]) => ({ id, ...data.nopagados }));
    }

    const retorno = {};
    retorno.topEmpresasNoPagados = empresasArray;
    retorno.topParticularesNoPagados = particularesArray;

    return res.status(200).json(retorno);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener estadisticas', detalle: error });
    }
  }
};
