const { Ubicaciones, Empresas, ContactoEmpresas } = require('../models');
const validator = require('validator');

exports.createContactoEmpresa = async (req, res) => {
  const { nombre, cedula, descripcion, email, empresaId, ubicacionId } = req.body;

  // Validaciones
  if (!nombre) return res.status(400).json({ error: 'El nombre del contacto es obligatorio' });
  if (cedula && !validator.isLength(cedula, { min: 8, max: 8 })) return res.status(400).json({ error: 'La cédula debe tener 8 caracteres' });
  if (email && !validator.isEmail(email)) return res.status(400).json({ error: 'El email no es válido' });
  if (!empresaId) return res.status(400).json({ error: 'El id de la empresa es obligatorio' });

  // Sanitización
  const sanitizedNombre = validator.escape(nombre);
  const sanitizedCedula = cedula ? validator.escape(cedula) : null;
  const sanitizedDescripcion = descripcion ? validator.escape(descripcion) : null;
  const sanitizedEmail = email ? validator.normalizeEmail(email) : null;

  try {
    if (ubicacionId) {
      const ubi = await Ubicaciones.findByPk(ubicacionId);
      if (!ubi) return res.status(404).json({ error: 'Ubicacion no existe' });
    }

    const empresa = await Empresas.findByPk(empresaId);
    if (!empresa) return res.status(404).json({ error: 'Cliente de tipo empresa no existe' });

    const nuevoContacto = await ContactoEmpresas.create({
      nombre: sanitizedNombre,
      cedula: sanitizedCedula,
      descripcion: sanitizedDescripcion,
      email: sanitizedEmail,
      empresaId,
      ubicacionId,
    });
    res.status(201).json(nuevoContacto);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al crear el contacto', detalle: error });
  }
};

exports.getContactoEmpresa = async (req, res) => {
  const { contactoEmpresaId } = req.params;

  try {
    const contacto = await ContactoEmpresas.findByPk(contactoEmpresaId, {
      include: [
        { model: Empresas, as: 'empresa' },
        { model: Ubicaciones, required: false, as: 'ubicacion' },
      ],
    });
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.status(200).json(contacto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el contacto', detalle: error });
  }
};

exports.getAllContactoEmpresas = async (req, res) => {
  try {
    const contactosEmpresas = await ContactoEmpresas.findAll({
      include: [
        { model: Empresas, as: 'empresa' },
        { model: Ubicaciones, required: false, as: 'ubicacion' },
      ],
    });
    res.status(200).json(contactosEmpresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los contactos de empresas' });
  }
};

exports.asignarUbicacion = async (req, res) => {
  const { contactoEmpresaId } = req.params; // ID del contacto de empresa
  const { ubicacionId } = req.body; // ID de la ubicación asignada

  try {
    // Buscar el contacto de empresa por su ID
    const cliente = await ContactoEmpresas.findByPk(contactoEmpresaId);

    // Verificar si el contacto de empresa existe
    if (!cliente) return res.status(404).json({ error: 'El contacto de empresa no existe' });

    // Verificar si la ubicación asignada existe
    const ubicacionAsignada = await Ubicaciones.findByPk(ubicacionId);
    if (!ubicacionAsignada) return res.status(404).json({ error: 'La ubicación asignada no existe' });

    // Verificar si ambos tienen el mismo cliente de empresa vinculado
    if (cliente.empresaId !== ubicacionAsignada.empresaId) {
      return res.status(400).json({ error: 'El contacto de empresa y la ubicación asignada no pertenecen a la misma empresa' });
    }

    // Asignar la ubicación asignada al contacto de empresa
    cliente.ubicacionId = ubicacionId;
    await cliente.save();

    // Enviar respuesta exitosa
    res.status(200).json({ detalle: 'Ubicación asignada correctamente al contacto de empresa' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al asignar la ubicación al contacto de empresa', detalle: error });
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
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el contacto', detalle: error });
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
    res.status(500).json({ error: 'Error al eliminar el contacto', detalle: error });
  }
};
