const handleErrors = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      console.error('Error:', error);
      const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

      if (errorsSequelize.length > 0) {
        res.status(500).json({ error: 'Error en la operación', detalle: errorsSequelize });
      } else {
        res.status(500).json({ error: 'Error en la operación', detalle: error.message, stack: error.stack.message, stack: error.stack });
      }
    }
  };
};

module.exports = handleErrors;
