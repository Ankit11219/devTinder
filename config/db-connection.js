    const mongoose = require('mongoose');

    // Your MongoDB connection string (replace with your actual string)
    // For local MongoDB: 'mongodb://127.0.0.1:27017/yourDatabaseName'
    // For MongoDB Atlas: 'mongodb+srv://<username>:<password>@<cluster-url>/yourDatabaseName?retryWrites=true&w=majority'
    const dbURI = 'mongodb+srv://ankitraj11219:Fu0Rbjfxvk5oUXsp@nodejsselfproject.qfzlh1z.mongodb.net/devTinder?retryWrites=true&w=majority&appName=NodejsSelfProject';

    mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

    // Optional: Handle connection events
    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });