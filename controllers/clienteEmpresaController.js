const { ClienteEmpresas } = require('../models');

// GET ALL
exports.getAllClienteEmpresas = async (req, res) => {
  try {
    const clientes = await ClienteEmpresas.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener todas las empresas', detalle: error });
  }
};

// GET
exports.getClienteEmpresa = async (req, res) => {
  try {
    const cliente = await ClienteEmpresas.findByPk(req.params.id);
    if (!cliente) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la empresa', detalle: error });
  }
};

// POST
exports.createClienteEmpresa = async (req, res) => {
  try {
    const cliente = await ClienteEmpresas.create(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la empresa', detalle: error });
  }
};

// PUT
exports.updateClienteEmpresa = async (req, res) => {
  try {
    const [updated] = await ClienteEmpresas.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    const updatedCliente = await ClienteEmpresas.findByPk(req.params.id);
    res.status(200).json(updatedCliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la empresa', detalle: error });
  }
};
