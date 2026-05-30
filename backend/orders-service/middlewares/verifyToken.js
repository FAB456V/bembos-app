const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(
      authorization.slice('Bearer '.length),
      process.env.JWT_SECRET
    );
    req.auth = { userId: payload.sub, email: payload.email };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}

module.exports = verifyToken;
