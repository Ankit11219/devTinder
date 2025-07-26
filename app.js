const express = require('express');
require('./config/db-connection');
const app = express();

const cookieParser = require('cookie-parser');

const userAuthRouter = require('./routes/userAuth');
const profileRouter = require('./routes/profile');
const connectionRequestRouter = require('./routes/connectionRequest');
const userRouter = require('./routes/user');

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use('/api', userAuthRouter);
app.use('/api', profileRouter);
app.use('/api', connectionRequestRouter);
app.use('/api/user', userRouter);




const User = require('./models/user');
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