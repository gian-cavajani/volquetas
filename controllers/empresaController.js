const { Empresas, Obras, ContactoEmpresas, Telefonos } = require('../models');
const validator = require('validator');
const { Op } = require('sequelize');

exports.createEmpresa = async (req, res) => {
  const { rut, nombre, descripcion, razonSocial } = req.body;

  // Validaciones
  if (rut && !validator.isLength(rut, { min: 12, max: 12 })) return res.status(400).json({ error: 'El RUT debe tener 12 caracteres.' });
  if (!nombre) return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });

  try {
    const nuevoCliente = await Empresas.create({
      rut,
      razonSocial,
      nombre,
      descripcion,
    });
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear empresa', detalle: error });
    }
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
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener empresa', detalle: error });
    }
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
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener empresas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener empresas', detalle: error });
    }
  }
};

exports.buscarEmpresa = async (req, res) => {
  try {
    const { rut, nombre, razonSocial, letraInicial } = req.query;

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
    if (letraInicial) {
      if (letraInicial.length !== 1) return res.status(400).json({ error: 'La búsqueda por letra inicial debe tener solo una letra' });
      searchCriteria.nombre = { [Op.iLike]: `${letraInicial}%` };
    }
    if (!rut && !nombre && !razonSocial && !letraInicial) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un parámetro de búsqueda (rut, nombre, razonSocial, letraInicial).' });
    }

    const empresas = await Empresas.findAll({
      where: searchCriteria,
    });

    res.status(200).json(empresas);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al buscar empresas', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al buscar empresas', detalle: error });
    }
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

    // updatedEmpresa.nombre = validator.unescape(updatedEmpresa.nombre);
    res.status(200).json(updatedEmpresa);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar empresa', detalle: error });
    }
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
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar empresa', detalle: error });
    }
  }
};
