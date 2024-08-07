const { Jornales, Movimientos, Empleados } = require('../models');
const { Op } = require('sequelize');
const { calcularHoras } = require('../utils/calcularHoras');
const moment = require('moment');
const validator = require('validator');
const db = require('../config/db');

exports.nuevoJornal = async (req, res) => {
  let { empleadoId, fecha, entrada, salida, tipo } = req.body;
  const usuarioId = req.user.id;

  // Validaciones
  if (!empleadoId) {
    return res.status(400).json({ error: 'El empleadoId es obligatorio' });
  }
  if (!['trabajo', 'licencia', 'enfermedad', 'falta'].includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
  if (!fecha || isNaN(Date.parse(fecha))) {
    return res.status(400).json({ error: 'La fecha es obligatoria y debe ser válida' });
  }
  if (tipo === 'trabajo') {
    if (!entrada || typeof entrada !== 'string') {
      return res.status(400).json({ error: 'La hora de entrada es obligatoria y debe ser un string' });
    }
    if (!salida || typeof salida !== 'string') {
      return res.status(400).json({ error: 'La hora de salida es obligatoria y debe ser un string' });
    }
  }

  //si el empleado no trabajo se asegura que se borren las horas pasadas en el body.
  if (tipo !== 'trabajo') {
    entrada = null;
    salida = null;
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
      creadoPor: usuarioId,
      tipo,
    });

    res.status(201).json(jornal);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el jornal', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el jornal', detalle: error.message, stack: error.stack });
    }
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
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar el jornal', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar el jornal', detalle: error.message, stack: error.stack });
    }
  }
};

exports.editarJornal = async (req, res) => {
  const { jornalId } = req.params;
  const { empleadoId, fecha, entrada, salida, tipo } = req.body;
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

    jornal = await jornal.update({ empleadoId, fecha, entrada, salida, tipo });
    res.status(200).json(jornal);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al editar el jornal', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al editar el jornal', detalle: error.message, stack: error.stack });
    }
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
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el jornal', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el jornal', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getJornalesPorEmpleado = async (req, res) => {
  const { empleadoId, fechaInicio, fechaFin } = req.params;

  const empleado = await Empleados.findByPk(empleadoId);
  if (!empleado) return res.status(400).json({ error: 'Empleado no existe' });

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Debe ingresar fecha de inicio y fecha de fin' });
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio) || isNaN(fin)) {
    return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas' });
  }

  if (inicio > fin) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la de final' });
  }

  try {
    // Obtener los jornales del chofer en el rango de fechas
    const jornales = await Jornales.findAll({
      where: {
        empleadoId,
        fecha: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
    });

    // Obtener los movimientos del chofer en el rango de fechas
    const movimientos = await Movimientos.findAll({
      where: {
        choferId: empleadoId,
        horario: {
          [Op.between]: [inicio, fin.setDate(fin.getDate() + 1)],
        },
      },
    });

    // Procesar los jornales y movimientos
    const jornalesResumen = [];

    jornales.forEach((jornal) => {
      const fecha = new Date(jornal.fecha);
      const tipo = jornal.tipo.toUpperCase();
      const horas = jornal.entrada && jornal.salida ? (new Date(`1970-01-01T${jornal.salida}Z`) - new Date(`1970-01-01T${jornal.entrada}Z`)) / 3600000 : 0;
      const horasExtra = jornal.horasExtra || 0;

      const viajes = movimientos.reduce(
        (acc, mov) => {
          const movDia = new Date(mov.horario).toISOString().slice(0, 10);
          if (movDia === fecha.toISOString().slice(0, 10)) {
            if (mov.tipo === 'entrega') acc.entregas += 1;
            if (mov.tipo === 'levante') acc.levantes += 1;
          }
          return acc;
        },
        { entregas: 0, levantes: 0 }
      );

      if (empleado.rol === 'chofer') {
        jornalesResumen.push({
          fecha: fecha.toISOString().slice(0, 10),
          tipo,
          horas,
          horasExtra,
          entrada: jornal.entrada,
          salida: jornal.salida,
          entregas: viajes.entregas,
          levantes: viajes.levantes,
          viajes: viajes.entregas + viajes.levantes,
        });
      } else {
        //jornal sin datos de viajes
        jornalesResumen.push({
          fecha: fecha.toISOString().slice(0, 10),
          tipo,
          horas,
          extra,
          entrada: jornal.entrada,
          salida: jornal.salida,
        });
      }
    });

    res.status(200).json(jornalesResumen);
  } catch (error) {
    console.error('Error al obtener jornales del empleado:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener jornales del empleado', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener jornales del empleado', detalle: error.message, stack: error.stack });
    }
  }
};
// exports.getJornalesPorEmpleado = async (req, res) => {
//   const { empleadoId, fechaInicio, fechaFin } = req.params;
//   try {
//     const jornales = await Jornales.findAll({
//       where: {
//         empleadoId,
//         fecha: { [Op.and]: [{ [Op.gte]: fechaInicio }, { [Op.lte]: fechaFin }] },
//       },
//     });
//     if (!jornales || jornales.length === 0) return res.status(404).json({ error: 'No hay jornales' });

//     res.status(200).json(jornales);
//   } catch (error) {
//     console.error(error.message);
//     const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

//     if (errorsSequelize.length > 0) {
//       res.status(500).json({ error: 'Error al obtener los jornales', detalle: errorsSequelize });
//     } else {
//       res.status(500).json({ error: 'Error al obtener los jornales', detalle: error.message, stack: error.stack });
//     }
//   }
// };

exports.getDatosPorEmpleado = async (req, res) => {
  const { empleadoId, fechaInicio, fechaFin } = req.params;

  try {
    const datos = await Jornales.findAll({
      where: {
        empleadoId: empleadoId,
        fecha: { [Op.and]: [{ [Op.gte]: fechaInicio }, { [Op.lte]: fechaFin }] },
      },
      attributes: [
        'empleadoId',
        [db.fn('COUNT', db.col('id')), 'registros'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN 1 ELSE 0 END`)), 'diasTrabajo'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'licencia' THEN 1 ELSE 0 END`)), 'diasLicencia'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'enfermedad' THEN 1 ELSE 0 END`)), 'diasEnfermedad'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'falta' THEN 1 ELSE 0 END`)), 'diasFalta'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN EXTRACT(EPOCH FROM (salida - entrada)) / 3600 ELSE 0 END`)), 'horasTrabajadas'],
        [db.fn('SUM', db.col('horasExtra')), 'horasExtra'],
      ],

      group: ['empleadoId'],
      raw: true,
    });
    res.status(200).json(...datos);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los datos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los datos', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getAllDatosPorPeriodo = async (req, res) => {
  //datos
  const { fechaInicio, fechaFin } = req.params;

  try {
    const datos = await Jornales.findAll({
      where: {
        fecha: { [Op.and]: [{ [Op.gte]: fechaInicio }, { [Op.lte]: fechaFin }] },
      },
      attributes: [
        'empleadoId',
        [db.fn('COUNT', db.col('id')), 'registros'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN 1 ELSE 0 END`)), 'diasTrabajo'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'licencia' THEN 1 ELSE 0 END`)), 'diasLicencia'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'enfermedad' THEN 1 ELSE 0 END`)), 'diasEnfermedad'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'falta' THEN 1 ELSE 0 END`)), 'diasFalta'],
        [db.fn('SUM', db.literal(`CASE WHEN tipo = 'trabajo' THEN EXTRACT(EPOCH FROM (salida - entrada)) / 3600 ELSE 0 END`)), 'horasTrabajadas'],
        [db.fn('SUM', db.col('horasExtra')), 'horasExtra'],
      ],

      group: ['empleadoId'],
      raw: true,
    });
    res.status(200).json(datos);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener los datos', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener los datos', detalle: error.message, stack: error.stack });
    }
  }
};
