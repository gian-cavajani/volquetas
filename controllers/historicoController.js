const { HistoricoUsoCamion, Empleados, Camiones } = require('../models');

exports.registrarUsoCamion = async (req, res) => {
  const { empleadoId, camionId, fechaInicio } = req.body;

  try {
    const chofer = await Empleados.findOne({ where: { id: empleadoId } });
    const camion = await Camiones.findOne({ where: { id: camionId } });
    //validar que empleado o chofer existan
    if (!camion || !chofer) throw Error('Camion o Chofer no existe');
    //validar que empleado sea chofer
    if (chofer.rol !== 'chofer') throw Error('Empleado debe ser de tipo chofer'); // Buscar el registro activo del camión

    const registroActivo = await HistoricoUsoCamion.findOne({
      where: {
        camionId,
        fechaFin: null,
      },
    });

    if (registroActivo) {
      if (registroActivo.fechaInicio >= Date.parse(fechaInicio)) {
        return res.status(400).json({
          error: 'Fecha de inicio de uso del camion no puede ser anterior a la ultima fecha de inicio de uso',
        });
      }
      // Actualizar la fecha de finalización del registro activo
      registroActivo.fechaFin = fechaInicio;
      await registroActivo.save();
    } // Crear el nuevo registro de histórico de uso de camión

    const nuevoHistorico = await HistoricoUsoCamion.create({
      empleadoId,
      camionId,
      fechaInicio,
      fechaFin: null,
    });

    res.status(201).json(nuevoHistorico);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear el historico-camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear el historico-camion', detalle: error.message, stack: error.stack });
    }
  }
};

//Obtener asignaciones de camiones actuales (todos los camiones)
exports.obtenerAsignacionesActuales = async (req, res) => {
  try {
    // Buscar el registro activo en el historial de uso de camiones
    const asignacionesActuales = await HistoricoUsoCamion.findAll({
      where: {
        fechaFin: null,
      },
      include: [
        {
          model: Empleados,
          attributes: ['nombre'],
        },

        {
          model: Camiones,
          attributes: ['matricula'],
        },
      ],
    });

    res.status(200).json(asignacionesActuales);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el historico-camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el historico-camion', detalle: error.message, stack: error.stack });
    }
  }
};

//Obtener todas las asignaciones de un camion o empleado especifico
exports.obtenerHistoricoPorCamionOEmpleado = async (req, res) => {
  const { camionId, empleadoId } = req.query;

  try {
    let historico;

    if (camionId) {
      // Buscar historial por camión
      historico = await HistoricoUsoCamion.findAll({
        where: {
          camionId,
        },
        include: [
          { model: Empleados, attributes: ['nombre'] },
          // { model: Camiones, attributes: ['matricula'] },
        ],
      });
    } else if (empleadoId) {
      // Buscar historial por empleado
      historico = await HistoricoUsoCamion.findAll({
        where: {
          empleadoId,
        },
        include: [
          // { model: Empleados, attributes: ['nombre'] },
          { model: Camiones, attributes: ['matricula'] },
        ],
      });
    } else {
      res.status(400).json({
        error: 'Debes proporcionar un id de camion o un id de empleado',
      });
      return;
    }

    res.status(200).json(historico);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener el historico-camion', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener el historico-camion', detalle: error.message, stack: error.stack });
    }
  }
};
