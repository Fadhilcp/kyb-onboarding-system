import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} [http://localhost:${PORT}]`);
  console.log(`📋 Health check available at: http://localhost:${PORT}/api/health`);
});

export default server;
