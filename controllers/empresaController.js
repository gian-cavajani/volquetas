const { Empresas, Obras, ContactoEmpresas, Telefonos } = require('../models');
const validator = require('validator');
const { Op } = require('sequelize');

exports.createEmpresa = async (req, res) => {
  const { rut, nombre, descripcion, razonSocial } = req.body;

  // Validaciones
  if (rut && !validator.isLength(rut, { min: 12, max: 12 })) return res.status(400).json({ error: 'El RUT debe tener 12 caracteres.' });
  if (!nombre) return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });

  // Sanitización
  const sanitizedRut = rut ? validator.escape(rut) : null;
  const sanitizedrazonSocial = razonSocial ? validator.escape(razonSocial) : null;
  const sanitizedNombre = validator.escape(nombre);
  const sanitizedDescripcion = descripcion ? validator.escape(descripcion) : null;

  try {
    const nuevoCliente = await Empresas.create({
      rut: sanitizedRut,
      razonSocial: sanitizedrazonSocial,
      nombre: sanitizedNombre,
      descripcion: sanitizedDescripcion,
    });
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al crear la empresa', detalle: error });
  }
};

exports.getEmpresa = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const empresa = await Empresas.findByPk(empresaId, {
      include: [
        {
          model: Obras,
          as: 'obras',
          required: false,
          attributes: ['id', 'calle', 'esquina', 'numeroPuerta', 'activa'],
        },
        {
          model: ContactoEmpresas,
          as: 'contactos',
          required: false,
          attributes: ['id', 'nombre', 'descripcion', 'email', 'obraId'],
          include: [{ model: Telefonos, attributes: ['tipo', 'telefono', 'extension'] }],
        },
      ],
    });

    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    res.status(200).json(empresa);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener la empresa', detalle: error.message });
  }
};

exports.getAllEmpresas = async (req, res) => {
  try {
    const empresas = await Empresas.findAll({
      attributes: ['id', 'nombre', 'rut'],
      //include: [
      //   {
      //     model: Obras,
      //     as: 'obras',
      //     required: false,
      //   },
      //   {
      //     model: ContactoEmpresas,
      //     as: 'contactos',
      //     required: false,
      //   },
      // ],
    });

    res.status(200).json(empresas);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener las empresas', detalle: error.message });
  }
};

exports.buscarEmpresa = async (req, res) => {
  try {
    const { rut, nombre, razonSocial } = req.query;

    const searchCriteria = {};

    if (rut) {
      searchCriteria.rut = { [Op.iLike]: `%${rut}%` };
    }
    if (nombre) {
      searchCriteria.nombre = { [Op.iLike]: `%${nombre}%` };
    }
    if (razonSocial) {
      searchCriteria.razonSocial = { [Op.iLike]: `%${razonSocial}%` };
    }

    if (!rut && !nombre && !razonSocial) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un parámetro de búsqueda (rut, nombre, razonSocial).' });
    }

    const empresas = await Empresas.findAll({
      where: searchCriteria,
    });

    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar empresas', detalle: error.message });
  }
};
exports.updateEmpresa = async (req, res) => {
  const { rut, nombre, descripcion, razonSocial } = req.body;
  if (rut && !validator.isLength(rut, { min: 12, max: 12 })) return res.status(400).json({ error: 'El RUT debe tener 12 caracteres.' });
  try {
    const [updated] = await Empresas.update(req.body, { where: { id: req.params.empresaId } });
    if (!updated) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    const updatedEmpresa = await Empresas.findByPk(req.params.empresaId);
    res.status(200).json(updatedEmpresa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la empresa', detalle: error.message });
  }
};

exports.deleteEmpresa = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const empresa = await Empresas.findByPk(empresaId);

    if (!empresa) return res.status(404).json({ error: 'La Empresa con ese id no existe' });
    await empresa.destroy();

    res.status(200).json({ detalle: `Empresa con nombre ${empresa.nombre} fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al eliminar la empresa', detalle: error });
  }
};
