const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
  try {
    const {token} = req.cookies; // Get token from cookies
    if (!token) {
      throw new Error('Token is missing');
    }
    
    const decoded = await jsonwebtoken.verify(token, 'devTinderSelfProject'); // Verify the token
    const user = await User.findById(decoded._id); // Find user by ID from token
    if (!user) {
      throw new Error('User not found');
    }
    
    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'UnAuthorized: '+ error.message });
  }
}

module.exports = userAuth; // Export the middleware for use in routes