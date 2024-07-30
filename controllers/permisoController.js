// controllers/permisosController.js
const { Permisos, Empresas, Particulares, Pedidos, Movimientos, Obras } = require('../models');
const { Op } = require('sequelize');
const validator = require('validator');

exports.crearPermiso = async (req, res) => {
  const { fechaCreacion, fechaVencimiento, empresaId, particularId, id } = req.body;

  console.log(req.body);

  if (!fechaCreacion || isNaN(Date.parse(fechaCreacion))) {
    return res.status(400).json({ error: 'La fecha de creacion obligatoria y debe ser válida' });
  }
  if (fechaVencimiento && isNaN(Date.parse(fechaVencimiento))) {
    return res.status(400).json({ error: 'Fecha de vencimiento no es válida. Debe ser una fecha ISO8601.' });
  }

  if (!validator.isLength(id, { min: 1 })) {
    return res.status(400).json({ error: 'Número de solicitud no puede estar vacío.' });
  }

  if (new Date(fechaCreacion) > new Date(fechaVencimiento)) return res.status(400).json({ error: 'Fecha de creacion debe ser anterior a la de vencimiento.' });

  try {
    const nuevoPermiso = await Permisos.create(req.body);
    res.status(201).json(nuevoPermiso);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el permiso', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear permiso', detalle: error.message, stack: error.stack });
    }
  }
};

exports.obtenerPermisos = async (req, res) => {
  try {
    const permisos = await Permisos.findAll();
    res.status(200).json(permisos);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los permisos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los permisos', detalle: error.message, stack: error.stack });
    }
  }
};

exports.obtenerPermiso = async (req, res) => {
  const { permisoId } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  try {
    const pedidosWhere = {};

    if (fechaInicio && fechaFin) {
      if (fechaFin < fechaInicio) return res.status(400).json({ error: 'FechaFin debe ser despues de fechaInicio' });
      pedidosWhere.createdAt = { [Op.between]: [fechaInicio, fechaFin] };
    }

    const permiso = await Permisos.findByPk(permisoId, {
      include: [
        {
          model: Pedidos,
          attributes: ['id', 'descripcion', 'createdAt', 'estado'],
          where: pedidosWhere,
          required: false,
          include: [
            {
              model: Movimientos,
              attributes: ['id', 'horario'],
            },
            {
              model: Obras,
              attributes: ['id'],
            },
          ],
        },
      ],
    });

    res.status(200).json(permiso);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el permiso', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el permiso', detalle: error.message, stack: error.stack });
    }
  }
};

exports.obtenerPermisosPorEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { activo } = req.query;

    let whereCondition = { empresaId };

    if (activo && activo.toLowerCase() === 'si') {
      // Filtrar por permisos activos (fechaVencimiento > fecha actual)
      whereCondition.fechaVencimiento = {
        [Op.gt]: new Date(),
      };
    }

    const permisos = await Permisos.findAll({
      where: whereCondition,
      attributes: ['id', 'fechaCreacion', 'fechaVencimiento'],
    });

    res.status(200).json(permisos);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los permisos por empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los permisos por empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.obtenerPermisosPorParticular = async (req, res) => {
  try {
    const { particularId } = req.params;
    const { activo } = req.query;

    let whereCondition = { particularId };

    if (activo && activo.toLowerCase() === 'si') {
      whereCondition.fechaVencimiento = {
        [Op.gt]: new Date(),
      };
    }

    const permisos = await Permisos.findAll({
      where: whereCondition,
      attributes: ['id', 'fechaCreacion', 'fechaVencimiento'],
    });

    res.status(200).json(permisos);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los permisos por particular', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los permisos por particular', detalle: error.message, stack: error.stack });
    }
  }
};

exports.actualizarPermiso = async (req, res) => {
  const { permisoId } = req.params;
  const { fechaCreacion, fechaVencimiento, empresaId, particularId } = req.body;

  try {
    const permiso = await Permisos.findByPk(permisoId);
    if (!permiso) res.status(404).json({ error: 'Permiso no encontrado' });

    if (fechaCreacion && fechaVencimiento) {
      if (new Date(fechaCreacion) > new Date(fechaVencimiento)) return res.status(400).json({ error: 'Fecha de creacion debe ser anterior a la de vencimiento.' });
    }
    if (fechaCreacion) {
      if (new Date(fechaCreacion) > new Date(permiso.fechaVencimiento)) return res.status(400).json({ error: 'Fecha de creacion debe ser anterior a la de vencimiento.' });
      permiso.fechaCreacion = fechaCreacion;
    }

    if (fechaVencimiento) {
      if (new Date(permiso.fechaCreacion) > new Date(fechaVencimiento)) return res.status(400).json({ error: 'Fecha de creacion debe ser anterior a la de vencimiento.' });
      permiso.fechaVencimiento = fechaVencimiento;
    }
    if (empresaId) {
      const empresa = await Empresas.findByPk(empresaId);
      if (!empresa) res.status(404).json({ error: 'Empresa no encontrada' });
      permiso.empresaId = empresaId;
    }
    if (particularId) {
      const particular = await Particulares.findByPk(particularId);
      if (!particular) res.status(404).json({ error: 'Particular no encontrado' });
      permiso.particularId = particularId;
    }

    permiso.save();
    return res.status(200).json(permiso);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar el permiso', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar el permiso', detalle: error.message, stack: error.stack });
    }
  }
};

exports.eliminarPermiso = async (req, res) => {
  try {
    const { permisoId } = req.params;
    const deleted = await Permisos.destroy({
      where: { id: permisoId },
    });
    if (deleted) {
      res.status(204).json({ detalle: 'Permiso eliminado' });
    } else {
      res.status(404).json({ error: 'Permiso no encontrado' });
    }
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar el permiso', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar el permiso', detalle: error.message, stack: error.stack });
    }
  }
};
