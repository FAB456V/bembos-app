function verifyServiceKey(req, res, next) {
  const serviceKey = req.headers['x-service-key'];

  if (!serviceKey || serviceKey !== process.env.SERVICE_API_KEY) {
    return res.status(401).json({ message: 'Credencial de servicio invalida' });
  }

  return next();
}

module.exports = verifyServiceKey;
