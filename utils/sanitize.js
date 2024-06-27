const validator = require('validator');

const sanitizeData = (data) => {
  const sanitizedData = {};

  for (const key in data) {
    if (typeof data[key] === 'string') {
      sanitizedData[key] = validator.escape(data[key]);
    } else {
      sanitizedData[key] = data[key]; // Deja otros tipos de datos sin cambios
    }
  }

  return sanitizedData;
};

module.exports = sanitizeData;
