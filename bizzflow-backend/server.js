const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Auth-Token'],
  exposedHeaders: ['x-auth-token', 'X-Auth-Token'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection with retry mechanism
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB Connected Successfully');
      return true;
    } catch (err) {
      console.error('MongoDB Connection Error Details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      if (i === retries - 1) throw err;
      console.log('Retrying connection in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB after retries:', err);
  process.exit(1);
});

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/payroll', require('./routes/payroll'));

// Initialize counters
const Counter = require('./models/Counter');
Counter.initializeCounters()
  .then(() => console.log('Counters initialized successfully'))
  .catch(err => console.error('Error initializing counters:', err));

// Global Error Handler with detailed logging
app.use((err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    mongoState: mongoose.connection.readyState
  });

  // Check MongoDB connection state
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? 'MongoDB is not connected' : 'Internal Server Error'
    });
  }

  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Missing');
  console.log('JWT Secret:', process.env.JWT_SECRET ? 'Configured' : 'Missing');
}); 