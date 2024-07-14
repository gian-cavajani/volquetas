const { Cajas, Empleados, Obras, Pedidos, Particulares, Empresas } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const validator = require('validator');

exports.nuevaCaja = async (req, res) => {
  const { fecha, motivo, empleadoId, pedidoId, monto, descripcion, moneda } = req.body;

  try {
    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'La fecha es obligatoria y debe ser válida' });
    }

    if (!monto) {
      return res.status(400).json({ error: 'Monto es obligatorio' });
    }

    if (!['vale', 'gasto', 'ingreso', 'ingreso pedido', 'ingreso cochera', 'extraccion'].includes(motivo)) {
      return res.status(400).json({ error: "Motivo inválido, debe ser: ('vale', 'gasto','ingreso', 'ingreso pedido', 'ingreso cochera', 'extraccion')" });
    }
    if (!['dolar', 'peso'].includes(moneda)) {
      return res.status(400).json({ error: "Moneda inválida, debe ser: ('dolar' o 'peso')" });
    }

    if (['ingreso', 'ingreso pedido', 'ingreso cochera'].includes(motivo)) {
      if (monto < 0) return res.status(400).json({ error: 'Monto inválido, este tipo de motivo debe tener monto positivo' });
    } else {
      if (monto > 0) return res.status(400).json({ error: 'Monto inválido, este tipo de motivo debe tener monto negativo' });
    }

    if (motivo === 'vale' && !empleadoId) {
      return res.status(400).json({ error: 'Debe agregar un empleado para el vale' });
    }
    if (motivo === 'ingreso pedido' && !pedidoId) {
      return res.status(400).json({ error: 'Debe agregar un pedido para el ingreso de tipo pedido' });
    }

    if (empleadoId) {
      const empleado = Empleados.findByPk(empleadoId);
      if (!empleado) return res.status(404).json({ error: 'Empleado no existe' });
    }

    if (pedidoId) {
      const pedido = Pedidos.findByPk(pedidoId);
      if (!pedido) return res.status(404).json({ error: 'Pedido no existe' });
    }

    const nuevaCaja = await Cajas.create({
      fecha,
      motivo,
      empleadoId,
      pedidoId,
      monto,
      descripcion,
      moneda,
    });

    res.status(201).json(nuevaCaja);
  } catch (error) {
    console.error(error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la caja', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la caja', detalle: error });
    }
  }
};

exports.getCajas = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  const whereClause = {};

  if (fechaInicio && fechaFin) {
    if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });
    whereClause.fecha = { [Op.between]: [fechaInicio, fechaFin] };
  } else {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  try {
    const cajas = await Cajas.findAll({
      order: [['fecha', 'DESC']],
      where: whereClause,
      include: [
        {
          model: Pedidos,
          required: false,
          attributes: ['id'],
          include: [
            {
              model: Obras,
              required: false,
              attributes: ['id', 'calle', 'numeroPuerta', 'esquina'],
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
        },
        {
          model: Empleados,
          required: false,
          attributes: ['id', 'nombre'],
        },
      ],
    });

    let montoPeso = 0;
    let montoDolar = 0;
    let contadorMotivos = {};
    cajas.map((c) => {
      const motivo = c.motivo;
      if (contadorMotivos[motivo]) {
        contadorMotivos[motivo]++;
      } else {
        contadorMotivos[motivo] = 1;
      }
      if (c.moneda === 'peso') {
        montoPeso += c.monto;
      } else {
        montoDolar += c.monto;
      }
    });

    res.status(200).json({ datos: { contadorMotivos, montoPeso, montoDolar }, cajas });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los datos de la caja', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los datos de la caja', detalle: error });
    }
  }
};

exports.getCaja = async (req, res) => {
  const { cajaId } = req.params;
  try {
    const caja = await Cajas.findByPk(cajaId, {
      include: [
        {
          model: Pedidos,
          required: false,
          attributes: ['id'],
          include: [
            {
              model: Obras,
              required: false,
              attributes: ['id', 'calle', 'numeroPuerta', 'esquina'],
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
        },
        {
          model: Empleados,
          required: false,
          attributes: ['id', 'nombre'],
        },
      ],
    });

    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });

    res.status(200).json(caja);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la caja', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la caja', detalle: error });
    }
  }
};

exports.eliminarCaja = async (req, res) => {
  try {
    const caja = await Cajas.findByPk(req.params.cajaId);

    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });

    await caja.destroy();

    res.status(200).json({ detalle: 'Caja eliminada exitosamente' });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar la caja', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar la caja', detalle: error });
    }
  }
};

exports.modificarCaja = async (req, res) => {
  const { cajaId } = req.params;
  const { fecha, motivo, empleadoId, pedidoId, monto, descripcion, moneda } = req.body;

  try {
    const caja = await Cajas.findByPk(cajaId);
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });

    if (fecha && isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'La fecha debe ser válida' });
    }

    if (motivo && !['vale', 'gasto', 'ingreso pedido', 'ingreso', 'ingreso cochera', 'extraccion'].includes(motivo)) {
      return res.status(400).json({ error: "Motivo inválido, debe ser: ('vale', 'gasto', 'ingreso', 'ingreso pedido', 'ingreso cochera', 'extraccion')" });
    }
    if (moneda && !['dolar', 'peso'].includes(moneda)) {
      return res.status(400).json({ error: "Moneda inválida, debe ser: ('dolar' o 'peso')" });
    }

    if (empleadoId) {
      const empleado = Empleados.findByPk(empleadoId);
      if (!empleado) return res.status(404).json({ error: 'Empleado no existe' });
      caja.empleadoId = empleadoId;
    }

    if (pedidoId) {
      const pedido = Pedidos.findByPk(pedidoId);
      if (!pedido) return res.status(404).json({ error: 'Pedido no existe' });
      caja.pedidoId = pedidoId;
    }

    if (motivo) caja.motivo = motivo;
    if (fecha) caja.fecha = fecha;
    if (monto) caja.monto = monto;
    if (descripcion) caja.descripcion = descripcion;
    if (moneda) caja.moneda = moneda;

    await caja.save();

    res.status(200).json(caja);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar la caja', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar la caja', detalle: error });
    }
  }
};
