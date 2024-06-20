const { Ubicaciones, ClienteEmpresas, ClienteParticulares, ContactoEmpresas } = require('../models');
const validator = require('validator');

exports.createUbicacion = async (req, res) => {
  const {
    dias,
    destinoFinal,
    calle,
    esquina,
    barrio,
    coordenadas,
    numeroPuerta,
    descripcion,
    detalleResiduos,
    residuosMezclados,
    residuosReciclados,
    frecuenciaSemanal,
    clienteParticularId,
    clienteEmpresaId,
  } = req.body;

  // Validaciones
  if (!calle) {
    return res.status(400).json({ error: 'La calle es obligatoria' });
  }
  if (frecuenciaSemanal && !validator.isInt(frecuenciaSemanal.toString(), { min: 1, max: 7 })) {
    return res.status(400).json({ error: 'La frecuencia semanal debe ser un número entre 1 y 7' });
  }

  // Sanitización
  const sanitizedCalle = validator.escape(calle);
  const sanitizedEsquina = esquina ? validator.escape(esquina) : null;
  const sanitizedBarrio = barrio ? validator.escape(barrio) : null;
  const sanitizedCoordenadas = coordenadas ? validator.escape(coordenadas) : null;
  const sanitizedNumeroPuerta = numeroPuerta ? validator.escape(numeroPuerta) : null;
  const sanitizedDescripcion = descripcion ? validator.escape(descripcion) : null;
  const sanitizedDetalleResiduos = detalleResiduos ? validator.escape(detalleResiduos) : null;
  const sanitizedDestinoFinal = destinoFinal ? validator.escape(destinoFinal) : null;
  const sanitizedDias = dias ? validator.escape(dias) : null;
  const sanitizedResiduosMezclados = residuosMezclados ? validator.toBoolean(residuosMezclados.toString()) : false;
  const sanitizedResiduosReciclados = residuosReciclados ? validator.toBoolean(residuosReciclados.toString()) : false;
  const sanitizedFrecuenciaSemanal = frecuenciaSemanal ? validator.toInt(frecuenciaSemanal.toString()) : null;
  const sanitizedClienteParticularId = clienteParticularId ? validator.toInt(clienteParticularId.toString()) : null;
  const sanitizedClienteEmpresaId = clienteEmpresaId ? validator.toInt(clienteEmpresaId.toString()) : null;

  try {
    const nuevaUbicacion = await Ubicaciones.create({
      calle: sanitizedCalle,
      esquina: sanitizedEsquina,
      barrio: sanitizedBarrio,
      coordenadas: sanitizedCoordenadas,
      numeroPuerta: sanitizedNumeroPuerta,
      descripcion: sanitizedDescripcion,
      detalleResiduos: sanitizedDetalleResiduos,
      residuosMezclados: sanitizedResiduosMezclados,
      residuosReciclados: sanitizedResiduosReciclados,
      destinoFinal: sanitizedDestinoFinal,
      dias: sanitizedDias,
      frecuenciaSemanal: sanitizedFrecuenciaSemanal,
      clienteParticularId: sanitizedClienteParticularId,
      clienteEmpresaId: sanitizedClienteEmpresaId,
    });
    res.status(201).json(nuevaUbicacion);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al crear la ubicación', detalle: error });
  }
};

exports.getAllUbicaciones = async (req, res) => {
  try {
    const ubicaciones = await Ubicaciones.findAll({
      include: [
        {
          model: ClienteEmpresas,
          required: false,
          as: 'clienteEmpresa',
        },
        {
          model: ContactoEmpresas,
          required: false,
        },
        {
          model: ClienteParticulares,
          required: false,
          as: 'clienteParticular',
        },
      ],
    });
    res.status(200).json(ubicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las ubicaciones' });
  }
};

exports.getUbicacion = async (req, res) => {
  const { ubicacionId } = req.params;

  try {
    const ubicacion = await Ubicaciones.findByPk(ubicacionId, {
      include: [
        {
          model: ClienteEmpresas,
          required: false,
          as: 'clienteEmpresa',
        },
        {
          model: ContactoEmpresas,
          required: false,
        },
        {
          model: ClienteParticulares,
          required: false,
          as: 'clienteParticular',
        },
      ],
    });
    if (!ubicacion) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    res.status(200).json(ubicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la ubicación', detalle: error });
  }
};

exports.updateUbicacion = async (req, res) => {
  try {
    const [updated] = await Ubicaciones.update(req.body, { where: { id: req.params.ubicacionId } });
    if (!updated) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }
    const updatedUbicacion = await Ubicaciones.findByPk(req.params.ubicacionId);
    res.status(200).json(updatedUbicacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la ubicación', detalle: error });
  }
};

exports.deleteUbicacion = async (req, res) => {
  const { ubicacionId } = req.params;

  try {
    const ubicacion = await Ubicaciones.findByPk(ubicacionId);

    if (!ubicacion) return res.status(404).json({ error: 'La ubicación no existe' });
    await ubicacion.destroy();

    res.status(200).json({ detalle: `Ubicación en la calle ${ubicacion.calle} ${ubicacion.numeroPuerta} eliminada correctamente` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al eliminar la ubicación', detalle: error });
  }
};
