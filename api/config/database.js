const dotenv = require('dotenv');
dotenv.config();  // Load environment variables

const mongoose = require('mongoose');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

module.exports = connectDB;