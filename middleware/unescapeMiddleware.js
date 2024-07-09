const validator = require('validator');

const unescapeMiddleware = (req, res, next) => {
  const oldJson = res.json;

  res.json = function (data) {
    const unescapedData = unescapeData(data);
    oldJson.call(this, unescapedData);
  };

  next();
};

const unescapeData = (data) => {
  if (data instanceof Date) {
    return data;
  } else if (typeof data === 'string') {
    return validator.unescape(data);
  } else if (Array.isArray(data)) {
    return data.map((item) => unescapeData(item));
  } else if (typeof data === 'object' && data !== null) {
    if (data.dataValues) {
      return unescapeData(data.dataValues);
    }
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = unescapeData(data[key]);
      return acc;
    }, {});
  }
  return data;
};

module.exports = unescapeMiddleware;
