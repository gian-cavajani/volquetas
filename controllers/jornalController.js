const { Jornales } = require('../models');
const { Op } = require('sequelize');
const { calcularHoras } = require('../functions/calcularHoras');
const moment = require('moment');

exports.nuevoJornal = async (req, res) => {
  const { empleadoId, fecha, entrada, salida } = req.body;
  const usuarioId = req.user.id;
  // Validaciones
  if (!empleadoId) {
    return res.status(400).json({ error: 'El empleadoId es obligatorio' });
  }
  if (!fecha || isNaN(Date.parse(fecha))) {
    return res.status(400).json({ error: 'La fecha es obligatoria y debe ser válida' });
  }
  if (!entrada || typeof entrada !== 'string') {
    return res.status(400).json({ error: 'La hora de entrada es obligatoria y debe ser un string' });
  }
  if (!salida || typeof salida !== 'string') {
    return res.status(400).json({ error: 'La hora de salida es obligatoria y debe ser un string' });
  }

  try {
    const existeJornal = await Jornales.findOne({
      where: { empleadoId, fecha },
    });

    if (existeJornal) {
      return res.status(400).json({ error: 'Ya existe un jornal para este empleado en la fecha especificada' });
    }

    const jornal = await Jornales.create({
      empleadoId,
      fecha,
      entrada,
      salida,
      usuarioId,
    });

    res.status(201).json(jornal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el jornal' });
  }
};

exports.borrarJornal = async (req, res) => {
  const { jornalId } = req.params;
  try {
    const jornal = await Jornales.findByPk(jornalId);
    if (!jornal) {
      return res.status(404).json({ error: 'Jornal no encontrado' });
    }
    await jornal.destroy();
    res.status(200).json({ message: 'Jornal borrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al borrar el jornal' });
  }
};

exports.editarJornal = async (req, res) => {
  const { jornalId } = req.params;
  const { empleadoId, fecha, entrada, salida } = req.body;
  try {
    let jornal = await Jornales.findByPk(jornalId);
    if (!jornal) {
      return res.status(404).json({ error: 'Jornal no encontrado' });
    }

    // Validar que no haya otro jornal para el mismo empleado en la misma fecha
    const jornalExistente = await Jornales.findOne({
      where: {
        empleadoId: jornal.empleadoId,
        fecha,
        id: { [Op.ne]: jornalId }, // Excluir el jornal actual
      },
    });

    if (jornalExistente) {
      return res.status(400).json({ error: 'Ya existe un jornal para este empleado en esta fecha' });
    }

    jornal = await jornal.update({ empleadoId, fecha, entrada, salida });
    res.status(200).json(jornal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar el jornal' });
  }
};

exports.getJornal = async (req, res) => {
  const { jornalId } = req.params;
  try {
    const jornal = await Jornales.findByPk(jornalId);
    if (!jornal) {
      return res.status(404).json({ error: 'Jornal no encontrado' });
    }
    res.status(200).json(jornal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el jornal' });
  }
};

exports.getJornalesPorEmpleadoMes = async (req, res) => {
  const { empleadoId, mes } = req.params;

  // Validar que mes tenga el formato YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(mes)) {
    return res.status(400).json({ error: 'El formato del mes debe ser YYYY-MM' });
  }
  try {
    const jornales = await Jornales.findAll({
      where: {
        empleadoId,
        fecha: {
          [Op.and]: [
            { [Op.gte]: new Date(mes + '-01') },
            {
              [Op.lt]: new Date(new Date(mes + '-01').setMonth(new Date(mes + '-01').getMonth() + 1)),
            },
          ],
        },
      },
    });

    if (!jornales || jornales.length === 0) {
      return res.status(404).json({ error: 'No hay jornales' });
    }

    res.status(200).json(jornales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los jornales' });
  }
};

exports.getHorasPorSemana = async (req, res) => {
  const { empleadoId, semana } = req.params;
  try {
    const fechaInicioSemana = moment(semana, 'YYYY-MM-DD').startOf('isoWeek');
    const fechaFinSemana = moment(semana, 'YYYY-MM-DD').endOf('isoWeek');
    const jornales = await Jornales.findAll({
      where: {
        empleadoId,
        fecha: {
          [Op.between]: [fechaInicioSemana.toDate(), fechaFinSemana.toDate()],
        },
      },
    });

    const { horasTrabajadas, horasExtras } = calcularHoras(jornales);
    res.status(200).json({ horasTrabajadas, horasExtras });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las horas trabajadas' });
  }
};

exports.getHorasPorMes = async (req, res) => {
  const { empleadoId, mes } = req.params;
  try {
    const fechaInicioMes = moment(mes, 'YYYY-MM').startOf('month');
    const fechaFinMes = moment(mes, 'YYYY-MM').endOf('month');
    const jornales = await Jornales.findAll({
      where: {
        empleadoId,
        fecha: {
          [Op.between]: [fechaInicioMes.toDate(), fechaFinMes.toDate()],
        },
      },
    });

    const { horasTrabajadas, horasExtras } = calcularHoras(jornales);
    res.status(200).json({ horasTrabajadas, horasExtras });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las horas trabajadas' });
  }
};
