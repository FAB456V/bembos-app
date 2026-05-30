const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function authResponse(user) {
  return {
    token: signToken(user),
    user: user.toPublicJSON(),
  };
}

async function register(req, res, next) {
  try {
    const { nombre, email, password, telefono, direcciones } = req.body || {};

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: 'nombre, email y password son obligatorios',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'password debe tener al menos 8 caracteres',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'El email ya esta registrado' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      nombre,
      email: normalizedEmail,
      passwordHash,
      telefono,
      direcciones,
    });

    return res.status(201).json(authResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'El email ya esta registrado' });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: 'email y password son obligatorios',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    return res.json(authResponse(user));
  } catch (error) {
    return next(error);
  }
}

async function profile(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user: user.toPublicJSON() });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, profile };
