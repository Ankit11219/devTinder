const validator = require('validator');
const validateSignupData = (data) => {
    // Validate firstName
    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim() === '') {
        throw new Error('First name is required and must be a string');
    }
    
    // Validate lastName
    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim() === '') {
        throw new Error('Last name is required and must be a string');
    }
    
    // Validate email
    if (!data.email || !validator.isEmail(data.email)) {
        throw new Error('A valid email is required');
    }
    
    // Validate password
    if (!data.password || !validator.isStrongPassword(data.password, { minLength: 6 })) {
        throw new Error('Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols');
    }
};

const validateEditAllowedProfileData = (reqBody) => {
    const validUpdates = ['firstName', 'lastName', 'about', 'gender', 'age', 'skills', 'photoUrl'];
    const isValidOperation = Object.keys(reqBody).every(update => validUpdates.includes(update));
    if (!isValidOperation) {
      return false;
    }
    return true;
}

module.exports = {
    validateSignupData,
    validateEditAllowedProfileData 
}