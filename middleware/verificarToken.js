const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Token de autorización no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRETO);
    req.user = decoded;
    next();
  } catch (error) {
    console.error({ error });
    return res
      .status(401)
      .json({ error: 'Debe iniciar Sesion <TOKEN INVALIDO>' });
  }
};

module.exports = verificarToken;
