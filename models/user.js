const mongoose = require('mongoose');
const validator = require('validator');

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
    validate(value){
      if(!['male', 'female', 'other'].includes(value)) {
        throw new Error('Gender must be male, female, or other');
    }
  },
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

const User = mongoose.model('User', userSchema);

module.exports = User;