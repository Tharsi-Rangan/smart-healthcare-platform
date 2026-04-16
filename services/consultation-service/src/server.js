import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5004;
    app.listen(PORT, () => {
      console.log(`Consultation service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start consultation service:', error.message);
    process.exit(1);
  }
};

startServer();
