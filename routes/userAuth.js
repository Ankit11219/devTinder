const express = require('express');
const userAuthRouter = express.Router();

const User = require('../models/user');
const bcrypt = require('bcrypt');
const { validateSignupData } = require('../utils/validation');


// Endpoint to create a new user
userAuthRouter.post('/signup', async (req, res) => {
  try{
    const reqData = {...req.body}; // Create a shallow copy of the request body
    validateSignupData(reqData); // validateSignupData is a function that validates the request data
    const hasedPassword = await bcrypt.hash(reqData.password, 10); // encrpt password
    reqData.password = hasedPassword; // replace password with encrypted password
    const user = new User(reqData); // Create a new user instance with the request data
    await user.save(); // Save the user to the database
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /login
userAuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() }); // Find user by email
    if (!user) {  
      throw new Error('Invalid credentials'); // If user not found, throw error
    }
    const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with stored hashed password
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = await user.getJwtToken(); // Generate JWT token using the method defined in user model
    res.cookie('token', token, {
      //httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      maxAge: 24 * 60 * 60 * 1000 // Cookie expiration time (1 day)
    });
    res.send('Login successful'); // If credentials match, send success response
  } catch (error) {
    // console.error('Error during login:', error.message);
    res.status(400).json({ error: error.message });
  }
});

userAuthRouter.post('/logout', (req, res) => {
  res.clearCookie('token').send('Logout successful'); // Clear the token cookie on logout

// Or alternatively, you can use res.cookie to set the token cookie to an empty string

  // Clear the token cookie by setting its value to an empty string and maxAge to 0
//   res.cookie('token', '', {
//     maxAge: 0 // Set cookie expiration to 0 to delete it
//   });
//   res.send('Logout successful'); // Send success response
});

module.exports = userAuthRouter;
