const jwt = require('jsonwebtoken');

const verificarTokenAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Token de autorización no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRETO);
    if (decoded.rol !== 'admin') {
      return res.status(401).json({
        error: 'Debe iniciar sesion como administrador para ver este segmento',
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error({ error });
    return res
      .status(401)
      .json({ error: 'Debe iniciar Sesion - TOKEN INVALIDO' });
  }
};

module.exports = verificarTokenAdmin;
