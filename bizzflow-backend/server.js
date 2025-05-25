const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/payroll', require('./routes/payroll'));

// MongoDB Connection with detailed error logging
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => {
  console.error('MongoDB Connection Error Details:', {
    message: err.message,
    code: err.code,
    stack: err.stack
  });
});

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
    headers: req.headers
  });
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