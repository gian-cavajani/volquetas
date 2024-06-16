const { ClienteEmpresas, ContactoEmpresas } = require('../models');

// GET ALL
exports.getAllContactoEmpresas = async (req, res) => {
  try {
    const contactos = await ContactoEmpresas.findAll();
    res.status(200).json(contactos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todos los contactos', detalle: error });
  }
};

// GET
exports.getContactoEmpresa = async (req, res) => {
  try {
    const contacto = await ContactoEmpresas.findByPk(req.params.id);
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.status(200).json(contacto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el contacto', detalle: error });
  }
};

// POST
exports.createContactoEmpresa = async (req, res) => {
  try {
    const contacto = await ContactoEmpresas.create(req.body);
    res.status(201).json(contacto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el contacto', detalle: error });
  }
};

// PUT
exports.updateContactoEmpresa = async (req, res) => {
  try {
    const [updated] = await ContactoEmpresas.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    const updatedContacto = await ContactoEmpresas.findByPk(req.params.id);
    res.status(200).json(updatedContacto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el contacto', detalle: error });
  }
};
