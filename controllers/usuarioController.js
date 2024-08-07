const { Telefonos, Usuarios, Empleados } = require('../models');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

exports.nuevoUsuario = async (req, res) => {
  try {
    const { rol, email, password, confirmPassword, empleadoId } = req.body;

    // Validaciones y sanitización
    if (!rol || !email || !password || !confirmPassword || !empleadoId) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    //Sanitiza datos para no tener inyecciones sql
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedRol = validator.escape(rol);

    //Validaciones
    if (!validator.isEmail(sanitizedEmail)) return res.status(400).json({ error: 'Email inválido' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    if (!['admin', 'normal'].includes(sanitizedRol)) return res.status(400).json({ error: 'Rol inválido' });

    const empleado = await Empleados.findByPk(empleadoId);
    //Validar que empleado exista
    if (!empleado) return res.status(400).json({ error: 'Empleado no existe' });

    // Encriptar la contraseña usando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await Usuarios.create({
      rol: sanitizedRol,
      email: sanitizedEmail,
      password: hashedPassword,
      empleadoId,
    });
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      empleadoId: newUser.empleadoId,
      rol: newUser.rol,
      activo: newUser.activo,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al crear usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al crear usuario', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener usuarios', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getUsuario = async (req, res) => {
  try {
    const usuario = await Usuarios.findByPk(req.params.usuarioId, {
      include: {
        model: Empleados,
      },
    });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener usuario', detalle: error.message, stack: error.stack });
    }
  }
};

exports.getUsuariosInactivos = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll({ where: { activo: false } });
    res.status(200).json(usuarios);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al obtener usuarios', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al obtener usuarios', detalle: error.message, stack: error.stack });
    }
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validar email y contraseña
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await Usuarios.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    if (!user.activo) return res.status(403).json({ error: 'Usuario no activado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Generar el token JWT con duración de 4 horas
    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.SECRETO, {
      expiresIn: '4h',
    });

    res.status(200).json({ token });
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al loguear usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al loguear usuario', detalle: error.message, stack: error.stack });
    }
  }
};

exports.confirmarUsuario = async (req, res) => {
  //usuario admin confirma a otros usuarios
  const { email } = req.body;
  // Validar email y contraseña
  if (!email) {
    return res.status(400).json({ error: 'Email es obligatorio' });
  }
  try {
    const user = await Usuarios.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario con ese mail no existe' });
    if (user.activo) return res.status(400).json({ error: 'Usuario ya esta activado' });

    user.activo = true;
    await user.save();
    res.status(202).json({
      detalle: `Usuario con mail: ${user.email} activado exitosamente`,
    });
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al confirmar usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al confirmar usuario', detalle: error.message, stack: error.stack });
    }
  }
};

exports.borrarUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Buscar el usuario por ID
    const usuario = await Usuarios.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Borrar el usuario
    await usuario.destroy();

    res.status(200).json({ detalle: 'Usuario borrado exitosamente' });
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al borrar usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al borrar usuario', detalle: error.message, stack: error.stack });
    }
  }
};

exports.modificarUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { rol, email, activo } = req.body;

    // Buscar el usuario por ID
    const usuario = await Usuarios.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar los datos del usuario
    usuario.rol = rol ? validator.escape(rol) : usuario.rol;
    usuario.email = email ? validator.escape(email) : usuario.email;
    usuario.activo = activo !== undefined ? activo : usuario.activo;

    await usuario.save();

    res.status(200).json(usuario);
  } catch (error) {
    const errorsSequelize = error.errors ? error.errors.map((err) => err.message) : [];

    if (errorsSequelize.length > 0) {
      res.status(500).json({ error: 'Error al modificar usuario', detalle: errorsSequelize });
    } else {
      res.status(500).json({ error: 'Error al modificar usuario', detalle: error.message, stack: error.stack });
    }
  }
};
