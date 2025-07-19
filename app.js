const express = require('express');
const bcrypt = require('bcrypt');
require('./config/db-connection');
const User = require('./models/user');
const { validateSignupData } = require('./utils/validation');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to create a new user
app.post('/api/signup', async (req, res) => {
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

app.post('/api/login', async (req, res) => {
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
    res.send('Login successful'); // If credentials match, send success response
  } catch (error) {
    // console.error('Error during login:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Endpoint to update an existing user
app.patch('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  const reqBody = req.body;
  // console.log('Update endpoint hit for user ID:', userId, 'with data:', reqBody);
  try {
    const validUpdates = ['firstName', 'lastName', 'about', 'gender', 'age', 'skills', 'photoUrl'];
    const updates = Object.keys(reqBody);
    const isValidOperation = updates.every(update => validUpdates.includes(update));
    if (!isValidOperation) {
      throw new Error('Invalid updates');
    }
    if(reqBody?.skills?.length > 10) {
      throw new Error('Skills array cannot exceed 10 items');
    }
    const user = await User.findByIdAndUpdate(userId, reqBody,
       { returnDocument: 'after', runValidators: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    // console.error('Error updating user:', error.message);
    res.status(400).json({ error: error.message });
  }
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});