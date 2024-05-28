const Usuarios = require('../models/Usuarios');
const Telefonos = require('../models/Telefonos');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

exports.nuevoUsuario = async (req, res) => {
  try {
    const {
      nombre,
      rol,
      email,
      telefonos,
      password,
      confirmPassword,
      //   activo,
    } = req.body;

    // Validaciones y sanitización
    if (
      !nombre ||
      !rol ||
      !email ||
      telefonos.length < 1 ||
      !password ||
      !confirmPassword
    ) {
      console.log(nombre, rol, email, telefonos, password, confirmPassword);
      return res
        .status(400)
        .json({ error: 'Todos los campos son obligatorios' });
    }

    //sanitiza datos para no tener inyecciones sql
    const sanitizedNombre = validator.escape(nombre);
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedRol = validator.escape(rol);

    if (!validator.isEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (!['admin', 'normal'].includes(sanitizedRol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // if (
    //   !Array.isArray(telefonos) ||
    //   telefonos.some((tel) => !validator.isMobilePhone(tel, 'any'))
    // ) {
    //   return res.status(400).json({ error: 'Teléfonos inválidos' });
    // }

    // Encriptar la contraseña usando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await Usuarios.create({
      nombre: sanitizedNombre,
      rol: sanitizedRol,
      email: sanitizedEmail,
      password: hashedPassword,
      activo: false,
    });

    // Crear los teléfonos asociados
    const phonePromises = telefonos.map((tel) =>
      Telefonos.create({ telefono: tel, userId: newUser.id })
    );
    await Promise.all(phonePromises);

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Email o teléfono ya existe' });
    } else {
      res.status(500).json({ error: 'Error al crear el usuario' });
    }
  }
};

exports.getUsuarios = async (req, res) => {
  console.log(req.user);
  try {
    const usuarios = await Usuarios.findAll({
      include: {
        model: Telefonos,
        attributes: ['telefono'],
      },
      attributes: ['id', 'nombre', 'rol', 'email', 'activo'],
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email y contraseña
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await Usuarios.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar el token JWT con duración de 4 horas
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRETO,
      {
        expiresIn: '4h',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
