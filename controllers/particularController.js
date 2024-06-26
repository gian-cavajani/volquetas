const { Obras, Telefonos, Particulares } = require('../models');
const validator = require('validator');

exports.createParticular = async (req, res) => {
  const { nombre, cedula, descripcion, email } = req.body;

  // Validaciones
  if (!nombre) return res.status(400).json({ error: 'El nombre del Particular es obligatorio' });
  if (email && !validator.isEmail(email)) return res.status(400).json({ error: 'El email no es válido' });
  if (cedula.length !== 8) return res.status(400).json({ error: 'Cedula invalida, deben ser 8 numeros' });

  // Sanitización
  const sanitizedNombre = validator.escape(nombre);
  const sanitizedcedula = cedula ? validator.escape(cedula) : '';
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
    res.status(500).json({ error: 'Error al crear el Cliente Particular', detalle: error });
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
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el particular', detalle: error });
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
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los Clientes Particulares' });
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
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el particular', detalle: error });
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
    res.status(500).json({ error: 'Error al eliminar el particular', detalle: error });
  }
};
