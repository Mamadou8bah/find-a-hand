const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  
  // Debug logging
  console.log('=== Handyman Auth Middleware ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Auth Header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? 'Present' : 'Missing');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { id: decoded.handyman?.id, role: decoded.handyman?.role });
    
    if (!decoded.handyman || !decoded.handyman.id) {
      console.log('Invalid token structure - missing handyman data');
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    req.handyman = decoded.handyman;
    console.log('Request handyman set:', req.handyman);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
