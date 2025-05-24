const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    // Optional: attach user info to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyAdmin;
