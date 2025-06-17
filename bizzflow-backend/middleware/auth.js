const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('X-Auth-Token');

    // Check if no token
    if (!token) {
      console.log('No auth token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      // Add user from payload
      req.user = decoded.user;

      // Log successful auth
      console.log('Authentication successful for user:', req.user.id);
      
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', {
        error: verifyError.message,
        token: token.substring(0, 10) + '...' // Log only first 10 chars for security
      });
      
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server Error in auth middleware' });
  }
}; 