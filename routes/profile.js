const express = require('express');
const profileRouter = express.Router();

const userAuth = require('../middlewares/userAuth');

const { validateEditAllowedProfileData } = require('../utils/validation');

// GET /profile
profileRouter.get('/profile/view', userAuth, async (req, res) => {
  try {
    res.json(req.user); // Send user data as response
  } catch (error) {
    // console.error('Error fetching profile:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /profile
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    if(!validateEditAllowedProfileData(req.body))
      throw new Error('Invalid updates');

    if(req.body?.skills?.length > 10) {
      throw new Error('Skills array cannot exceed 10 items');
    }

    req.user.set(req.body); // Update user data with the request body
    await req.user.save(); // Save the updated user data to the database

    res.json({
      message: 'Your Profile Data Update Successfully',
      data: req.user
     });
  } catch (error) {
    // console.error('Error fetching profile:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = profileRouter;
