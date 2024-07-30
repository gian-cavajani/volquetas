const { Obras, Empresas, ContactoEmpresas, Telefonos } = require('../models');
const validator = require('validator');

exports.createContactoEmpresa = async (req, res) => {
  const { nombre, descripcion, email, empresaId, obraId } = req.body;

  // Validaciones
  if (!nombre) return res.status(400).json({ error: 'El nombre del contacto es obligatorio' });
  if (email && !validator.isEmail(email)) return res.status(400).json({ error: 'El email no es válido' });
  if (!empresaId) return res.status(400).json({ error: 'El id de la empresa es obligatorio' });

  try {
    const empresa = await Empresas.findByPk(empresaId);
    if (!empresa) return res.status(404).json({ error: 'Cliente de tipo empresa no existe' });

    if (obraId) {
      const ubi = await Obras.findByPk(obraId);
      if (!ubi) return res.status(404).json({ error: 'Ubicacion no existe' });
    }

    const nuevoContacto = await ContactoEmpresas.create({
      nombre,
      descripcion,
      email,
      empresaId,
      obraId,
    });
    res.status(201).json(nuevoContacto);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el contacto empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el contacto empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getContactoEmpresa = async (req, res) => {
  const { contactoEmpresaId } = req.params;

  try {
    const contacto = await ContactoEmpresas.findByPk(contactoEmpresaId, {
      include: [
        { model: Empresas, as: 'empresa', attributes: ['nombre', 'rut'] },
        { model: Obras, required: false, as: 'obra', attributes: ['id', 'calle', 'esquina', 'numeroPuerta', 'activa'] },
        { model: Telefonos, required: false, attributes: ['id', 'tipo', 'telefono', 'extension'] },
      ],
    });
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.status(200).json(contacto);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el contacto empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el contacto empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getAllContactoEmpresas = async (req, res) => {
  try {
    const contactosEmpresas = await ContactoEmpresas.findAll({
      attributes: ['id', 'nombre', 'empresaId'],
      // include: [
      //   { model: Empresas, as: 'empresa' },
      //   { model: Obras, required: false, as: 'obra' },
      // ],
    });
    res.status(200).json(contactosEmpresas);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los contactos empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los contactos empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.asignarObra = async (req, res) => {
  const { contactoEmpresaId } = req.params; // ID del contacto de empresa
  const { obraId } = req.body; // ID de la obra asignada

  try {
    // Buscar el contacto de empresa por su ID
    const contactoEmpresa = await ContactoEmpresas.findByPk(contactoEmpresaId);

    // Verificar si el contacto de empresa existe
    if (!contactoEmpresa) return res.status(404).json({ error: 'El contacto de empresa no existe' });

    // Verificar si la obra asignada existe
    const obraAsignada = await Obras.findByPk(obraId);
    if (!obraAsignada) return res.status(404).json({ error: 'La obra asignada no existe' });

    // Verificar si ambos tienen el mismo cliente de empresa vinculado
    if (contactoEmpresa.empresaId !== obraAsignada.empresaId) {
      return res.status(400).json({ error: 'El contacto de la empresa y la obra asignada no pertenecen a la misma empresa' });
    }

    let output = 'asignada';
    if (contactoEmpresa.obraId) output = 're-asignada';

    // Asignar la obra al contacto de la empresa
    contactoEmpresa.obraId = obraId;
    await contactoEmpresa.save();

    // Enviar respuesta exitosa
    res.status(200).json({ detalle: `Obra ${output} correctamente al contacto de empresa` });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al asignar la obra al contacto de la empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al asignar la obra al contacto de la empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.updateContactoEmpresa = async (req, res) => {
  try {
    const [updated] = await ContactoEmpresas.update(req.body, { where: { id: req.params.contactoEmpresaId } });
    if (!updated) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    const updatedContacto = await ContactoEmpresas.findByPk(req.params.contactoEmpresaId);
    res.status(200).json(updatedContacto);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar contacto empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar contacto empresa', detalle: error.message, stack: error.stack });
    }
  }
};

exports.deleteContactoEmpresa = async (req, res) => {
  const { contactoEmpresaId } = req.params;

  try {
    const contacto = await ContactoEmpresas.findByPk(contactoEmpresaId);

    if (!contacto) return res.status(404).json({ error: 'El contacto de empresa con ese id no existe' });
    await contacto.destroy();

    res.status(200).json({ detalle: `Contacto con nombre ${contacto.nombre} fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar el contacto de la empresa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar el contacto de la empresa', detalle: error.message, stack: error.stack });
    }
  }
};
