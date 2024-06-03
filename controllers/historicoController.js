const { HistoricoUsoCamion, Empleados, Camiones } = require('../models');

exports.registrarUsoCamion = async (req, res) => {
  const { empleadoId, camionId } = req.body;

  try {
    const chofer = await Empleados.findOne({ where: { id: empleadoId } });
    const camion = await Camiones.findOne({ where: { id: camionId } });
    //validar que empleado o chofer existan
    if (!camion || !chofer) throw Error('Camion o Chofer no existe');
    //validar que empleado sea chofer
    if (chofer.rol !== 'chofer')
      throw Error('Empleado debe ser de tipo chofer'); // Buscar el registro activo del camión

    const registroActivo = await HistoricoUsoCamion.findOne({
      where: {
        camionId,
        fechaFin: null,
      },
    });

    const fechaInicio = Date.now();

    if (registroActivo) {
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
    console.error('Error al crear histórico de uso de camión:', error);
    res.status(500).json({
      message: 'Error al crear histórico de uso de camión',
      error: error.message,
    });
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
      include: [{ model: Empleados }, { model: Camiones }],
    });

    res.status(200).json(asignacionesActuales);
  } catch (error) {
    console.error('Error al obtener la asignación actual:', error);
    res.status(500).json({
      message: 'Error al obtener la asignación actual',
      error: error.message,
    });
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
          { model: Camiones, attributes: ['matricula'] },
        ],
      });
    } else if (empleadoId) {
      // Buscar historial por empleado
      historico = await HistoricoUsoCamion.findAll({
        where: {
          empleadoId,
        },
        include: [
          { model: Empleados, attributes: ['nombre'] },
          { model: Camiones, attributes: ['matricula'] },
        ],
      });
    } else {
      res.status(400).json({
        message: 'Debes proporcionar un id de camion o un id de empleado',
      });
      return;
    }

    res.status(200).json(historico);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener el historial', error: error.message });
  }
};
