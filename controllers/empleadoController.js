const { Empleados, Telefonos, Usuarios } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const validator = require('validator');

exports.nuevoEmpleado = async (req, res) => {
  const { nombre, cedula, rol, fechaEntrada, fechaSalida } = req.body;
  try {
    //Sanitizar campos
    const sanitizednombre = nombre ? validator.escape(nombre) : '';
    const sanitizedrol = rol ? validator.escape(rol) : '';
    const sanitizedcedula = cedula ? validator.escape(cedula) : '';

    //validaciones
    if (!fechaEntrada || isNaN(Date.parse(fechaEntrada))) {
      return res.status(400).json({ error: 'La fecha de entrada es obligatoria y debe ser válida' });
    }
    if (fechaSalida && isNaN(Date.parse(fechaSalida))) {
      return res.status(400).json({ error: 'La fecha de salida debe ser válida' });
    }

    if (cedula.length !== 8) {
      return res.status(400).json({ error: 'Cedula invalida, deben ser 8 numeros' });
    }

    if (!['admin', 'normal', 'chofer'].includes(sanitizedrol)) return res.status(400).json({ error: 'Rol inválido' });

    // Crear el empleado
    const nuevoEmpleado = await Empleados.create({
      nombre: sanitizednombre,
      cedula: sanitizedcedula,
      rol: sanitizedrol,
      fechaEntrada,
      fechaSalida,
    });

    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];
    res.status(500).json({ error: 'Error al crear empleado', detalle: errorsSequelize });
  }
};

exports.getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleados.findAll({
      include: [
        {
          model: Telefonos,
          required: false,
          attributes: ['id', 'tipo', 'telefono', 'extension'],
        },
      ],
    });

    res.status(200).json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los empleados', detalle: error });
  }
};

exports.getEmpleado = async (req, res) => {
  try {
    const empleado = await Empleados.findByPk(req.params.empleadoId, {
      include: {
        model: Telefonos,
        required: false,
        attributes: ['id', 'tipo', 'telefono', 'extension'],
      },
    });

    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    res.status(200).json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el empleado', detalle: error });
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
        error: 'No se puede eliminar el empleado porque tiene un usuario vinculado',
      });
    }

    await Empleados.destroy({
      where: { id: empleadoId },
    });

    res.status(200).json({ detalle: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado', detalle: error });
  }
};

exports.cambiarEstadoEmpleado = async (req, res) => {
  //usuario admin habilita/deshabilita a empleados
  const { empleadoId } = req.params;
  const { fechaSalida } = req.body;

  if (!empleadoId) return res.status(400).json({ error: 'id es obligatorio' });

  try {
    const empleado = await Empleados.findOne({ where: { id: empleadoId } });
    if (!empleado) return res.status(400).json({ error: 'Empleado no existe' });

    const { habilitado } = empleado;

    if (habilitado) {
      if (isNaN(Date.parse(fechaSalida))) return res.status(400).json({ error: 'Fecha incorrecta' });
      empleado.fechaSalida = fechaSalida;
    } else {
      empleado.fechaSalida = null;
    }

    empleado.habilitado = !habilitado;
    empleado.save();

    res.status(202).json({
      detalle: `Empleado ${empleado.nombre} con CI: ${empleado.cedula} fue ${empleado.habilitado ? 'habilitado' : 'deshabilitado'} exitosamente`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al habilitar/deshabilitar al empleado', detalle: error });
  }
};

exports.modificarEmpleado = async (req, res) => {
  const { empleadoId } = req.params;
  const { nombre, cedula, rol, habilitado, fechaEntrada, fechaSalida } = req.body;

  try {
    // Buscar el empleado por ID
    let empleado = await Empleados.findByPk(empleadoId);
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Sanitizar los campos
    const sanitizedNombre = nombre ? validator.escape(nombre) : empleado.nombre;
    const sanitizedRol = rol ? validator.escape(rol) : empleado.rol;

    // Validar la cédula y el rol
    if (cedula && cedula.length !== 8) {
      return res.status(400).json({ error: 'Cédula inválida, deben ser 8 números' });
    }
    if (rol && !['admin', 'normal', 'chofer'].includes(sanitizedRol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    if (fechaEntrada && isNaN(Date.parse(fechaEntrada))) {
      return res.status(400).json({ error: 'La fecha de entrada debe ser válida' });
    }

    if (fechaSalida && isNaN(Date.parse(fechaSalida))) {
      return res.status(400).json({ error: 'La fecha de salida debe ser válida' });
    }

    console.log(fechaEntrada ? fechaEntrada : empleado.fechaEntrada);
    // Actualizar los campos del empleado
    const nuevoEmpleado = await empleado.update({
      nombre: sanitizedNombre,
      cedula: cedula !== undefined ? cedula : empleado.cedula,
      rol: sanitizedRol,
      habilitado: habilitado !== undefined ? habilitado : empleado.habilitado,
      fechaEntrada: fechaEntrada ? fechaEntrada : empleado.fechaEntrada,
      fechaSalida: fechaSalida ? fechaSalida : empleado.fechaSalida,
    });

    res.status(200).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al modificar el empleado:', error);
    res.status(500).json({ error: 'Error al modificar el empleado', detalle: error });
  }
};

exports.getEmpleadosActivosYSinUsuario = async (req, res) => {
  try {
    const empleados = await Empleados.findAll({
      attributes: ['id', 'nombre'],
      where: {
        habilitado: true,
      },
      include: {
        model: Usuarios,
        required: false,
        attributes: ['id'],
      },
    });

    const empleadosSinUsuario = empleados.filter((empleado) => !empleado.Usuario).map((e) => ({ id: e.id, nombre: e.nombre }));
    res.status(200).json(empleadosSinUsuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener empleados sin usuario y activos', detalle: error });
  }
};
