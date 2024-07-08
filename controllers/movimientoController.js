const { where } = require('sequelize');
const { Permisos, PagoPedidos, Pedidos, Movimientos, Sugerencias, Obras, Particulares, Empresas, Empleados, Volquetas } = require('../models');
const validator = require('validator');
const { Op } = require('sequelize');

const validarMovimiento = async (req, pedido, volqueta) => {
  const { pedidoId, choferId, horario, numeroVolqueta, tipo } = req.body;

  if (!(tipo === 'entrega' || tipo === 'levante')) throw new Error('Tipo solo puede ser "entrega" o "levante"');
  if (!choferId) throw new Error('Movimiento debe tener Chofer');
  if (!pedidoId) throw new Error('Movimiento debe tener Pedido');
  if (!horario) throw new Error('Movimiento debe tener horario');
  if (!volqueta && numeroVolqueta) throw new Error('Volqueta no existe');

  if (choferId) {
    const chofer = await Empleados.findByPk(choferId);
    if (!chofer || !chofer.habilitado) throw new Error('Id de Chofer no es válido');
    if (chofer.rol !== 'chofer') throw new Error('Id de Chofer no es válido, Empleado no es chofer');
  }
  if (pedido) {
    const numMovimientos = await pedido.getCountMovimientos;

    if (tipo === 'entrega') {
      if (numMovimientos !== 0) throw new Error('Para crear la entrega el pedido no debe tener movimientos');
      if (volqueta && volqueta.ocupada) throw new Error('Volqueta esta siendo utilizada en otro lugar');
    } else if (tipo === 'levante') {
      if (numMovimientos !== 1) throw new Error('Para crear el levante el pedido debe tener 1 movimiento(Entrega)');
      const entrega = await pedido.getEntrega;
      if (entrega.numeroVolqueta) {
        if (entrega.numeroVolqueta !== numeroVolqueta) throw new Error('Volqueta del levante debe ser la misma que la de la entrega');
        if (new Date(entrega.horario) > new Date(horario)) throw new Error('El horario del levante debe ser despues de la entrega');
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

    await pedido.save();
    if (volqueta) await volqueta.save(); //To do: hacer el movimiento doble(entrega y levante a la misma vez)

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

exports.modificarMovimiento = async (req, res) => {
  //Del movimiento solo se puede modificar horario, volqueta y chofer
  const { movimientoId } = req.params;
  const { horario, pedidoId, tipo, numeroVolqueta, choferId } = req.body;
  try {
    if (tipo || pedidoId) return res.status(400).json({ error: 'El Tipo o el Pedido de movimiento no son modificables' });
    if (!(choferId || horario || numeroVolqueta)) return res.status(400).json({ error: 'Debe incluir algun campo valido a modificar (chofer, horario, numero de volqueta)' });

    if (!(tipo === 'entrega' || tipo === 'levante')) {
      return res.status(400).json({ error: 'Tipo solo puede ser "entrega" o "levante"' });
    }
    const movimiento = await Movimientos.findByPk(movimientoId);
    if (!movimiento) return res.status(404).json({ error: 'No existe movimiento' });

    const pedido = await Pedidos.findByPk(movimiento.pedidoId, { include: [Movimientos] });

    let entrega = await pedido.getEntrega;
    let levante = await pedido.getLevante;
    if (numeroVolqueta) {
      const volquetaNueva = await Volquetas.findByPk(numeroVolqueta);
      if (volquetaNueva.ocupada) return res.status(400).json({ error: 'Volqueta esta en uso' });
      if (entrega.numeroVolqueta) {
        //si tiene volqueta
        const volquetaVieja = await Volquetas.findByPk(entrega.numeroVolqueta);
        volquetaVieja.ocupada = false;
        await volquetaVieja.save();
      }

      entrega.numeroVolqueta = numeroVolqueta;
      await entrega.save();
      if (levante) {
        levante.numeroVolqueta = numeroVolqueta;
        await levante.save();
      } else {
        volquetaNueva.ocupada = true;
      }
      await volquetaNueva.save();
    }

    if (horario) {
      if (movimiento.tipo === 'levante') {
        if (new Date(entrega.horario) > new Date(horario)) return res.status(400).json({ error: 'horario de levante debe ser despues del de entrega' });
      } else {
        if (levante && new Date(levante.horario) < new Date(horario)) return res.status(400).json({ error: 'horario de entrega debe ser antes del de levante' });
      }
    }

    movimiento.horario = horario ? horario : movimiento.horario;
    if (choferId) {
      const chofer = await Empleados.findByPk(choferId);
      if (!chofer || !chofer.habilitado) throw new Error('Id de Chofer sugerido no es válido');
      if (chofer.rol !== 'chofer') throw new Error('Id de Chofer sugerido no es válido, Empleado no es chofer');
    }
    movimiento.choferId = choferId ? choferId : movimiento.choferId;
    await movimiento.save();

    res.status(200).json({ detalle: 'Movimiento(s) modificados' });
  } catch (error) {
    console.error('Error al modificar el movimiento:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar el movimiento', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar el movimiento', detalle: error.message });
    }
  }
};

exports.getMovimientos = async (req, res) => {
  try {
    const movs = await Movimientos.findAll({});
    res.status(200).json(movs);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener movimientos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener movimientos', detalle: error });
    }
  }
};

exports.eliminarMovimiento = async (req, res) => {
  const { movimientoId } = req.params;
  try {
    const movimiento = await Movimientos.findByPk(movimientoId);
    if (!movimiento) return res.status(404).json({ error: 'No existe movimiento' });

    const pedido = await Pedidos.findByPk(movimiento.pedidoId, { include: [Movimientos] });
    let entrega = await pedido.getEntrega;
    let levante = await pedido.getLevante;
    let detalle = '';

    if (movimiento.tipo === 'levante') {
      //borrar levante
      if (levante.numeroVolqueta) {
        const volqueta = await Volquetas.findByPk(levante.numeroVolqueta);
        if (!volqueta.ocupada) {
          volqueta.ocupada = true;
          await volqueta.save();
        } else {
          detalle =
            'Movimiento eliminado, Pero la Volqueta de este pedido esta siendo utilizada en algun otro lugar. Volqueta no puede ser usada en dos pedidos a la vez (Elimine la entrega o modifique su volqueta)';
        }
        pedido.estado = 'entregado';
        await pedido.save();
      }
    } else {
      //borrar entrega
      if (levante) return res.status(400).json({ error: 'Debe eliminar el levante primero' });
      if (entrega.numeroVolqueta) {
        const volqueta = await Volquetas.findByPk(entrega.numeroVolqueta);
        volqueta.ocupada = false;
        await volqueta.save();
      }
      pedido.estado = 'iniciado';
      await pedido.save();
    }

    await movimiento.destroy();

    if (detalle.length < 1) {
      detalle = 'Movimiento eliminado exitosamente';
    }
    res.status(200).json({ detalle });
  } catch (error) {
    console.error('Error al eliminar el movimiento:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar el movimiento', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar el movimiento', detalle: error.message });
    }
  }
};

exports.countMovimientosPorChofer = async (req, res) => {
  try {
    const { choferId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Debe proporcionar las fechas de inicio y fin' });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const finMasUno = fin.setDate(fin.getDate() + 1);

    if (isNaN(inicio) || isNaN(fin)) {
      return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas' });
    }
    if (inicio > fin) return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la de final' });

    // Contar los movimientos de tipo 'entrega'
    const entregasCount = await Movimientos.count({
      where: {
        choferId,
        tipo: 'entrega',
        horario: {
          [Op.between]: [inicio, finMasUno],
        },
      },
    });

    // Contar los movimientos de tipo 'levante'
    const levantesCount = await Movimientos.count({
      where: {
        choferId,
        tipo: 'levante',
        horario: {
          [Op.between]: [inicio, finMasUno],
        },
      },
    });

    // Calcular el total de movimientos
    const totalCount = entregasCount + levantesCount;

    res.status(200).json({
      entregas: entregasCount,
      levantes: levantesCount,
      total: totalCount,
    });
  } catch (error) {
    console.error('Error al contar los movimientos:', error);
    res.status(500).json({ error: 'Error al contar los movimientos', detalle: error.message });
  }
};

// exports.countMovimientosChoferesActivos = async (req, res) => {
//   try {
//     const { fechaInicio, fechaFin } = req.query;

//     if (!fechaInicio || !fechaFin) {
//       return res.status(400).json({ error: 'Debe proporcionar las fechas de inicio y fin' });
//     }

//     const inicio = new Date(fechaInicio);
//     const fin = new Date(fechaFin);
//     const finMasUno = fin.setDate(fin.getDate() + 1);
//     // const inicio = fechaInicio;
//     // const fin = fechaFin;

//     if (isNaN(inicio) || isNaN(fin)) {
//       return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas' });
//     }
//     if (inicio > fin) return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la de final' });

//     const choferesActivos = await Empleados.findAll({
//       where: {
//         habilitado: true,
//         rol: 'chofer',
//       },
//       attributes: ['id'],
//     });

//     const choferIds = choferesActivos.map((chofer) => chofer.id);

//     // Contar los movimientos de tipo 'entrega' para choferes activos
//     const entregasCount = await Movimientos.count({
//       where: {
//         choferId: {
//           [Op.in]: choferIds,
//         },
//         tipo: 'entrega',
//         horario: {
//           [Op.between]: [inicio, finMasUno],
//         },
//       },
//     });

//     // Contar los movimientos de tipo 'levante' para choferes activos
//     const levantesCount = await Movimientos.count({
//       where: {
//         choferId: {
//           [Op.in]: choferIds,
//         },
//         tipo: 'levante',
//         horario: {
//           [Op.between]: [inicio, finMasUno],
//         },
//       },
//     });

//     // Calcular el total de movimientos
//     const totalCount = entregasCount + levantesCount;

//     // Devolver el resultado en la estructura JSON requerida
//     res.status(200).json({
//       entregas: entregasCount,
//       levantes: levantesCount,
//       total: totalCount,
//     });
//   } catch (error) {
//     console.error('Error al contar los movimientos:', error);
//     res.status(500).json({ error: 'Error al contar los movimientos', detalle: error.message });
//   }
// };
