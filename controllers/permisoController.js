// controllers/permisosController.js
const { Permisos, Empresas, Particulares } = require('../models');
const { Op } = require('sequelize');
const validator = require('validator');

exports.crearPermiso = async (req, res) => {
  const { fechaCreacion, fechaVencimiento, empresaId, particularId, id } = req.body;

  if (!fechaCreacion || isNaN(Date.parse(fechaCreacion))) {
    return res.status(400).json({ error: 'La fecha de creacion obligatoria y debe ser válida' });
  }
  if (fechaVencimiento && isNaN(Date.parse(fechaVencimiento))) {
    return res.status(400).json({ error: 'Fecha de vencimiento no es válida. Debe ser una fecha ISO8601.' });
  }

  if (!validator.isLength(id, { min: 1 })) {
    return res.status(400).json({ error: 'Número de solicitud no puede estar vacío.' });
  }

  try {
    const nuevoPermiso = await Permisos.create(req.body);
    res.status(201).json(nuevoPermiso);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el permiso', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear permiso', detalle: error });
    }
  }
};

exports.obtenerPermisos = async (req, res) => {
  try {
    const permisos = await Permisos.findAll();
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los permisos', detalle: error.message });
  }
};

exports.obtenerPermisosPorEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const permisos = await Permisos.findAll({
      where: { empresaId },
      attributes: ['id', 'fechaCreacion', 'fechaVencimiento'],
    });
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los permisos por empresa', detalle: error.message });
  }
};

exports.actualizarPermiso = async (req, res) => {
  try {
    const { permisoId } = req.params;
    const [updated] = await Permisos.update(req.body, {
      where: { id: permisoId },
    });
    if (updated) {
      const updatedPermiso = await Permisos.findOne({ where: { id: permisoId } });
      res.status(200).json(updatedPermiso);
    } else {
      res.status(404).json({ error: 'Permiso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el permiso', detalle: error.message });
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
    res.status(500).json({ error: 'Error al eliminar el permiso', detalle: error.message });
  }
};
