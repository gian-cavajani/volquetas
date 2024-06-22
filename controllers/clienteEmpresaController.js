const { Empresas, Ubicaciones, ContactoEmpresas } = require('../models');
const validator = require('validator');

exports.createClienteEmpresa = async (req, res) => {
  const { rut, nombre, descripcion } = req.body;

  // Validaciones
  if (!rut || !validator.isLength(rut, { min: 12, max: 12 })) return res.status(400).json({ error: 'El RUT debe tener 12 caracteres y es obligatorio.' });
  if (!nombre) return res.status(400).json({ error: 'El nombre de la empresa es obligatorio' });

  // Sanitización
  const sanitizedRut = validator.escape(rut);
  const sanitizedNombre = validator.escape(nombre);
  const sanitizedDescripcion = descripcion ? validator.escape(descripcion) : null;

  try {
    const nuevoCliente = await Empresas.create({
      rut: sanitizedRut,
      nombre: sanitizedNombre,
      descripcion: sanitizedDescripcion,
    });
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al crear el cliente', detalle: error });
  }
};

exports.getClienteEmpresa = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const empresa = await Empresas.findByPk(empresaId, {
      include: [
        {
          model: Ubicaciones,
          as: 'ubicaciones',
          required: false,
        },
        {
          model: ContactoEmpresas,
          as: 'contactos',
          required: false,
        },
      ],
    });

    if (!empresa) return res.status(404).json({ error: 'Cliente Empresa no encontrado' });

    res.status(200).json(empresa);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener el cliente empresa', detalle: error.message });
  }
};

exports.getAllClienteEmpresas = async (req, res) => {
  try {
    const clientes = await Empresas.findAll({
      include: [
        {
          model: Ubicaciones,
          as: 'ubicaciones',
          required: false,
        },
        {
          model: ContactoEmpresas,
          as: 'contactos',
          required: false,
        },
      ],
    });

    res.status(200).json(clientes);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al obtener las empresas cliente', detalle: error.message });
  }
};

exports.updateClienteEmpresa = async (req, res) => {
  try {
    const [updated] = await Empresas.update(req.body, { where: { id: req.params.empresaId } });
    if (!updated) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    const updatedCliente = await Empresas.findByPk(req.params.empresaId);
    res.status(200).json(updatedCliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la empresa', detalle: error.message });
  }
};

exports.deleteClienteEmpresa = async (req, res) => {
  const { empresaId } = req.params;

  try {
    const cliente = await Empresas.findByPk(empresaId);

    if (!cliente) return res.status(404).json({ error: 'El cliente de tipo empresa con ese id no existe' });
    await cliente.destroy();

    res.status(200).json({ detalle: `Cliente con RUT ${cliente.rut} fue eliminado correctamente` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al eliminar el cliente', detalle: error });
  }
};
