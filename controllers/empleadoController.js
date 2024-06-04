const { Empleados, Telefonos, Usuarios } = require('../models');
const validator = require('validator');

exports.nuevoEmpleado = async (req, res) => {
  const { nombre, cedula, rol } = req.body;
  try {
    //Sanitizar campos
    const sanitizednombre = nombre ? validator.escape(nombre) : '';
    const sanitizedrol = rol ? validator.escape(rol) : '';
    if (cedula.toString().length !== 8) {
      return res
        .status(400)
        .json({ error: 'Cedula invalida, deben ser 8 numeros' });
    }
    if (!['admin', 'normal', 'chofer'].includes(sanitizedrol))
      return res.status(400).json({ error: 'Rol inválido' });
    // Crear el empleado
    const nuevoEmpleado = await Empleados.create({
      nombre: sanitizednombre,
      cedula,
      rol: sanitizedrol,
    });

    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    const errorsSequelize = error.errors
      ? error.errors.map((err) => err.message)
      : [];
    res
      .status(500)
      .json({ error: 'Error al crear empleado', detalle: errorsSequelize });
  }
};

exports.getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleados.findAll({
      include: {
        model: Telefonos,
        attributes: ['telefono'],
      },
    });

    res.status(200).json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
};

exports.getEmpleado = async (req, res) => {
  try {
    const empleado = await Empleados.findByPk(req.params.empleadoId, {
      include: {
        model: Telefonos,
        attributes: ['telefono'],
      },
    });
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.status(200).json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
};

exports.eliminarEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.empleadoId;
    const empleado = await Empleados.findByPk(empleadoId);

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Verificar si el empleado tiene un usuario vinculado
    const usuario = await Usuarios.findOne({
      where: { empleadoId: empleadoId },
    });
    if (usuario) {
      return res.status(400).json({
        error:
          'No se puede eliminar el empleado porque tiene un usuario vinculado',
      });
    }

    await Empleados.destroy({
      where: { id: empleadoId },
    });

    res.status(200).json({ detalle: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

exports.cambiarEstadoEmpleado = async (req, res) => {
  //usuario admin habilita/deshabilita a empleados
  const { empleadoId } = req.params;

  if (!empleadoId) {
    return res.status(400).json({ error: 'id es obligatorio' });
  }

  try {
    const empleado = await Empleados.findOne({ where: { id: empleadoId } });
    if (!empleado) return res.status(400).json({ error: 'Empleado no existe' });

    const { habilitado } = empleado;

    empleado.habilitado = !habilitado;
    empleado.save();

    res.status(202).json({
      detalle: `Empleado ${empleado.nombre} con CI: ${empleado.cedula} fue ${
        empleado.habilitado ? 'habilitado' : 'deshabilitado'
      } exitosamente`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Error al habilitar/deshabilitar al empleado' });
  }
};
