const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { StatusCodes } = require('http-status-codes');


dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB connected');
    return {
      status: StatusCodes.OK,
      message: 'database connected successfully'
    };
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = connectDb;
