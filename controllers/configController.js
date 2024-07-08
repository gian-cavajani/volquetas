const { Config } = require('../models');
const { Op } = require('sequelize');

exports.createConfig = async (req, res) => {
  try {
    const { anio, precioSinIva, horasDeTrabajo, configActiva } = req.body;

    // Si configActiva es true, asegurarse de que no haya otra configuración activa
    if (configActiva) {
      await Config.update({ configActiva: false }, { where: { configActiva: true } });
    }

    const newConfig = await Config.create({
      anio,
      precioSinIva,
      horasDeTrabajo,
      configActiva,
    });

    res.status(201).json(newConfig);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear la configuración', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear la configuración', detalle: error });
    }
  }
};

exports.getConfigId = async (req, res) => {
  try {
    const config = await Config.findByPk(req.params.configId);

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la configuración', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la configuración', detalle: error });
    }
  }
};

exports.getConfigs = async (req, res) => {
  try {
    const configs = await Config.findAll();
    res.status(200).json(configs);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la configuración', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la configuración', detalle: error });
    }
  }
};

exports.getConfigActiva = async (req, res) => {
  try {
    const configActivada = await Config.findOne({ where: { configActiva: true } });
    res.status(200).json(configActivada);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener la configuración activa', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener la configuración activa', detalle: error });
    }
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { anio, precioSinIva, horasDeTrabajo, configActiva } = req.body;
    const config = await Config.findByPk(req.params.configId);

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    if (configActiva) {
      await Config.update({ configActiva: false }, { where: { configActiva: true } });
    }

    config.anio = anio !== undefined ? anio : config.anio;
    config.precioSinIva = precioSinIva !== undefined ? precioSinIva : config.precioSinIva;
    config.horasDeTrabajo = horasDeTrabajo !== undefined ? horasDeTrabajo : config.horasDeTrabajo;
    config.configActiva = configActiva !== undefined ? configActiva : config.configActiva;

    await config.save();

    res.status(200).json(config);
  } catch (error) {
    console.error(error.message);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al actualizar la configuración', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al actualizar la configuración', detalle: error });
    }
  }
};
