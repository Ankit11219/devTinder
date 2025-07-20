const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value){
      if(!validator.isEmail(value)) {
        throw new Error('Invalid email format' + value);
      }
    }
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    validate: function(value) {
      return value >= 18; // Validate that age is at least 18
    }
  },
  gender: {
    type: String,
    set: v => v ? v.toLowerCase() : v, // set value to lowercase
    enum: {
      values: ['male', 'female', 'other'], // Allowed values for
      message: `{VALUE} is not a valid gender` // Custom error message for invalid
    }
  },
  photoUrl: {
    type: String,
    default: 'https://www.shutterstock.com/image-vector/person-gray-photo-placeholder-woman-600nw-1241538838.jpg', // Default profile photo URL
    validate(value) {
      if(value && !validator.isURL(value)) {
        throw new Error('Invalid URL format for photoUrl');
      }
    }
  },
  about: {
    type: String,
    default: 'No description provided', // Default about text
  },
  skills: {
    type: [String] // Array of strings for skills
  }
},
{
  timestamps: true // Automatically manage createdAt and updatedAt fields by mongoose
  }
);

userSchema.methods.getJwtToken = async function() {
  const user = this; // Reference to the user instance
  // Generate a JWT token with the user's ID and a secret key
  const token = await jwt.sign(
    { _id: user._id },
    'devTinderSelfProject', // Your actual JWT secret
    { expiresIn: '1d' } // Token expiration time
  );
  return token; // Return the generated token
}

const User = mongoose.model('User', userSchema);

module.exports = User;