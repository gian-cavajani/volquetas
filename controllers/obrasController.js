const { Obras, Empresas, Particulares, ContactoEmpresas, ObraDetalles, Telefonos, Pedidos } = require('../models');
const validator = require('validator');
const { Op, Sequelize } = require('sequelize');

exports.createObra = async (req, res) => {
  const { dias, destinoFinal, calle, esquina, barrio, coordenadas, numeroPuerta, descripcion, detalleResiduos, residuosMezclados, residuosReciclados, frecuenciaSemanal, particularId, empresaId } =
    req.body;

  // Validaciones
  if (!calle) return res.status(400).json({ error: 'La calle es obligatoria' });
  if ((!empresaId && !particularId) || (empresaId && particularId)) {
    return res.status(400).json({ error: 'La Obra debe pertenecer exclusivamente a una empresa o a un particular' });
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
  // const sanitizedFrecuenciaSemanal = frecuenciaSemanal ? validator.toInt(frecuenciaSemanal.toString()) : null;
  const sanitizedParticularId = particularId ? validator.toInt(particularId.toString()) : null;
  const sanitizedEmpresaId = empresaId ? validator.toInt(empresaId.toString()) : null;

  try {
    if (sanitizedParticularId) {
      const particular = await Particulares.findByPk(sanitizedParticularId);
      if (!particular) return res.status(400).json({ error: 'Ese Particular no existe' });
    }
    if (sanitizedEmpresaId) {
      const empresa = await Empresas.findByPk(sanitizedEmpresaId);
      if (!empresa) return res.status(400).json({ error: 'Esa Empresa no existe' });
    }

    const obra = await Obras.create({
      calle: sanitizedCalle,
      esquina: sanitizedEsquina,
      barrio: sanitizedBarrio,
      coordenadas: sanitizedCoordenadas,
      numeroPuerta: sanitizedNumeroPuerta,
      descripcion: sanitizedDescripcion,
      particularId: sanitizedParticularId,
      empresaId: sanitizedEmpresaId,
    });
    const obraDetalles = await ObraDetalles.create({
      obraId: obra.id,
      detalleResiduos: sanitizedDetalleResiduos,
      residuosMezclados: sanitizedResiduosMezclados,
      residuosReciclados: sanitizedResiduosReciclados,
      destinoFinal: sanitizedDestinoFinal,
      dias: sanitizedDias,
      frecuenciaSemanal,
    });

    const fullObra = { ...obra.dataValues, obraDetalles };
    console.log(fullObra);

    res.status(201).json(fullObra);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la obra', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la obra', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getAllObras = async (req, res) => {
  try {
    const obras = await Obras.findAll({
      attributes: ['id', 'calle', 'esquina', 'numeroPuerta', 'activa', 'empresaId', 'particularId'],
      // include: [
      //   {
      //     model: Empresas,
      //     required: false,
      //     as: 'empresa',
      //     attributes: ['nombre'],
      //   },
      //   // {
      //   //   model: ContactoEmpresas,
      //   //   required: false,
      //   // },
      //   {
      //     model: Particulares,
      //     required: false,
      //     as: 'particular',
      //     attributes: ['nombre'],
      //   },
      // ],
    });
    res.status(200).json(obras);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener las obras', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener las obras', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getObra = async (req, res) => {
  const { obraId } = req.params;
  const { detalle } = req.query;

  try {
    let detalles = {
      include: [
        {
          model: Empresas,
          required: false,
          as: 'empresa',
          attributes: ['rut', 'nombre'],
        },
        {
          model: ContactoEmpresas,
          as: 'contactosDesignados',
          attributes: ['nombre', 'email'],
          required: false,
          include: { model: Telefonos, attributes: ['tipo', 'telefono', 'extension'] },
        },
        {
          model: Particulares,
          required: false,
          as: 'particular',

          attributes: ['nombre', 'email'],
          include: { model: Telefonos, attributes: ['tipo', 'telefono', 'extension'] },
        },
      ],
    };
    if (detalle === 'si') {
      detalles.include.push({ model: ObraDetalles, required: false });
    }
    const obra = await Obras.findByPk(obraId, detalles);
    if (!obra) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    res.status(200).json(obra);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la obra', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la obra', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getObrasConPedidosRecientes = async (req, res) => {
  const { cantidadMeses } = req.query;
  if (!cantidadMeses || cantidadMeses < 1) {
    return res.status(400).json({ error: 'La cantidad de meses debe ser mayor a 0' });
  }
  try {
    // Calcular la fecha de hace x meses
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - Number(cantidadMeses));

    // Buscar los pedidos en los últimos x meses
    const pedidos = await Pedidos.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaInicio,
        },
      },
      attributes: ['obraId', [Sequelize.fn('COUNT', Sequelize.col('obraId')), 'pedidoCount']],
      include: [
        {
          model: Obras,
          attributes: ['empresaId', 'particularId'],
          where: {
            particularId: null, // Filtrar solo obras de empresas
          },
        },
      ],
      group: ['obraId', 'Obra.id'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('obraId')), 'DESC']],
    });

    // Extraer los ids de las obras de los pedidos encontrados
    const obraIds = pedidos.map((pedido) => pedido.obraId);

    // Buscar las obras relacionadas con esos ids
    const obras = await Obras.findAll({
      where: {
        id: {
          [Op.in]: obraIds,
        },
      },
      include: [{ model: ObraDetalles }, { model: Empresas, as: 'empresa' }],
    });

    // Formatear la respuesta con el conteo de pedidos
    const resultado = obras.map((obra) => {
      const pedido = pedidos.find((p) => p.obraId === obra.id);
      return {
        ...obra.toJSON(),
        cantidadPedidos: pedido ? pedido.dataValues.pedidoCount : 0,
      };
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener obras con pedidos recientes:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener obras con pedidos recientes', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener obras con pedidos recientes', detalle: error.toString() });
    }
  }
};

exports.updateObra = async (req, res) => {
  try {
    const [updated] = await Obras.update(req.body, { where: { id: req.params.obraId } });
    if (!updated) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    const updatedObra = await Obras.findByPk(req.params.obraId);
    res.status(200).json(updatedObra);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar la obra', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar la obra', detalle: error.message, stack: error.stack });
    }
  }
};

exports.updateObraDetalles = async (req, res) => {
  try {
    const [updated] = await ObraDetalles.update(req.body, { where: { obraId: req.params.obraId } });
    if (!updated) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }
    const updatedObra = await Obras.findByPk(req.params.obraId, { include: [{ model: ObraDetalles }] });
    res.status(200).json(updatedObra);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar los detalles de la obra', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar los detalles de la obra', detalle: error.message, stack: error.stack });
    }
  }
};

exports.deleteObra = async (req, res) => {
  const { obraId } = req.params;

  try {
    const obra = await Obras.findByPk(obraId);

    if (!obra) return res.status(404).json({ error: 'La Obra no existe' });
    await obra.destroy();

    res.status(200).json({ detalle: `Obra en la calle ${obra.calle} ${obra.numeroPuerta} eliminada correctamente` });
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al eliminar la obra', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al eliminar la obra', detalle: error.message, stack: error.stack });
    }
  }
};
