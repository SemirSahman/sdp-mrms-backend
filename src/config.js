require('dotenv').config();
module.exports = {
  PORT: process.env.PORT || 4000,
  // Default includes credentials for local dev against dockerized Mongo
  MONGO_URI:
    process.env.MONGO_URI ||
    'mongodb://admin:password123@localhost:27017/mrms?authSource=admin',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || 'uploads',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@mrms.com'
};
