const validator = require('validator');
const { Telefonos, Empleados, Clientes } = require('../models');

exports.nuevoTelefono = async (req, res) => {
  try {
    const { telefono, tipo, extension, empleadoId, clienteId } = req.body;
    const sanitizedTipo = tipo ? validator.escape(tipo) : '';
    const sanitizedTelefono = telefono ? validator.escape(telefono) : '';
    const sanitizedExtension = extension ? validator.escape(extension) : '';

    if (!validator.isInt(sanitizedTelefono)) return res.status(400).json({ error: 'Telefono debe ser un string numerico' });

    if (!['celular', 'telefono'].includes(sanitizedTipo)) return res.status(400).json({ error: 'Tipo inválido' });
    if (!sanitizedTelefono) return res.status(400).json({ error: 'Debe incluir un telefono' });
    if (!empleadoId && !clienteId) return res.status(400).json({ error: 'Debe incluir al menos un propietario' });

    if (telefono.length !== 8 && tipo == 'telefono') return res.status(400).json({ error: 'Telefono debe incluir 8 numeros' });
    if (telefono.length !== 9 && tipo == 'celular') return res.status(400).json({ error: 'Celular debe incluir 9 numeros' });

    if (empleadoId) {
      const prop = await Empleados.findByPk(empleadoId);
      if (!prop) return res.status(400).json({ error: 'No hay tal empleado' });
    }
    if (clienteId) {
      const prop = await Clientes.findByPk(clienteId);
      if (!prop) return res.status(400).json({ error: 'No hay tal cliente' });
    }

    const nuevoTelefono = await Telefonos.create({
      telefono: sanitizedTelefono,
      tipo: sanitizedTipo,
      extension: sanitizedExtension,
      clienteId,
      empleadoId,
    });

    res.status(201).json({ nuevoTelefono });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el teléfono', detalle: error });
  }
};

exports.getAllTelefonos = async (req, res) => {
  try {
    const telefonos = await Telefonos.findAll({});
    res.status(200).json(telefonos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todos los teléfonos', detalle: error });
  }
};

exports.getTelefono = async (req, res) => {
  try {
    const telefono = await Telefonos.findByPk(req.params.telefonoId);
    if (!telefono) {
      return res.status(404).json({ error: 'Teléfono no encontrado' });
    }
    res.status(200).json(telefono);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el teléfono', detalle: error });
  }
};

exports.updateTelefono = async (req, res) => {
  try {
    const [updated] = await Telefonos.update(req.body, { where: { id: req.params.telefonoId } });
    if (!updated) {
      return res.status(404).json({ error: 'Teléfono no encontrado' });
    }
    const updatedTelefono = await Telefonos.findByPk(req.params.telefonoId);
    res.status(200).json(updatedTelefono);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el teléfono', detalle: error });
  }
};
