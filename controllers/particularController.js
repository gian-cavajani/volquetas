const { Obras, Telefonos, Particulares } = require('../models');
const validator = require('validator');
const { Op } = require('sequelize');

exports.createParticular = async (req, res) => {
  const { nombre, cedula, descripcion, email } = req.body;

  // Validaciones
  if (!nombre) return res.status(400).json({ error: 'El nombre del Particular es obligatorio' });
  if (email && !validator.isEmail(email)) return res.status(400).json({ error: 'El email no es válido' });
  if (cedula && cedula.length !== 8) return res.status(400).json({ error: 'Cedula invalida, deben ser 8 numeros' });

  // Sanitización
  const sanitizedNombre = validator.escape(nombre);
  const sanitizedcedula = cedula ? validator.escape(cedula) : null;
  const sanitizedEmail = email ? validator.normalizeEmail(email) : null;
  const sanitizedDescripcion = descripcion ? validator.escape(descripcion) : null;

  try {
    const nuevoParticular = await Particulares.create({
      nombre: sanitizedNombre,
      descripcion: sanitizedDescripcion,
      email: sanitizedEmail,
      cedula: sanitizedcedula,
    });

    res.status(201).json(nuevoParticular);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el particular', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el particular', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getParticular = async (req, res) => {
  const { particularId } = req.params;

  try {
    const particular = await Particulares.findByPk(particularId, {
      include: [
        { model: Obras, required: false, as: 'obras', attributes: ['id', 'calle', 'esquina', 'numeroPuerta', 'activa'] },
        { model: Telefonos, required: false, attributes: ['id', 'tipo', 'telefono', 'extension'] },
      ],
    });
    if (!particular) {
      return res.status(404).json({ error: 'Particular no encontrado' });
    }
    res.status(200).json(particular);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el particular', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el particular', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getAllParticulares = async (req, res) => {
  try {
    const particulares = await Particulares.findAll({
      attributes: ['id', 'nombre'],
      // include: [
      //   { model: Empresas, as: 'empresa' },
      //   { model: Obras, required: false, as: 'obra' },
      // ],
    });
    res.status(200).json(particulares);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los particulares', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los particulares', detalle: error.message, stack: error.stack });
    }
  }
};

exports.buscarParticular = async (req, res) => {
  try {
    const { nombre, email, cedula, letraInicial } = req.query;

    const searchCriteria = {};

    if (nombre) {
      searchCriteria.nombre = { [Op.iLike]: `%${nombre}%` };
    }
    if (email) {
      searchCriteria.email = { [Op.iLike]: `%${email}%` };
    }
    if (cedula) {
      searchCriteria.cedula = { [Op.iLike]: `%${cedula}%` };
    }
    if (letraInicial) {
      if (letraInicial.length !== 1) return res.status(400).json({ error: 'La búsqueda por letra inicial debe tener solo una letra' });
      searchCriteria.nombre = { [Op.iLike]: `${letraInicial}%` };
    }

    if (!nombre && !email && !cedula && !letraInicial) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un parámetro de búsqueda (nombre, email, cedula).' });
    }

    const particulares = await Particulares.findAll({
      where: searchCriteria,
    });

    res.status(200).json(particulares);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al buscar los particulares', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al buscar los particulares', detalle: error.message, stack: error.stack });
    }
  }
};

exports.updateParticular = async (req, res) => {
  try {
    const [updated] = await Particulares.update(req.body, { where: { id: req.params.particularId } });
    if (!updated) {
      return res.status(404).json({ error: 'Cliente Particular no encontrado' });
    }
    const updatedParticular = await Particulares.findByPk(req.params.particularId);
    res.status(200).json(updatedParticular);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar el particular', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar el particular', detalle: error.message, stack: error.stack });
    }
  }
};

exports.deleteParticular = async (req, res) => {
  const { particularId } = req.params;

  try {
    const particular = await Particulares.findByPk(particularId);

    if (!particular) return res.status(404).json({ error: 'El particular con ese id no existe' });
    await particular.destroy();

    res.status(200).json({ detalle: `Particular con nombre ${particular.nombre} fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar el particular', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar el particular', detalle: error.message, stack: error.stack });
    }
  }
};
