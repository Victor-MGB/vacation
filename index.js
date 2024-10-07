require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors package


// Initialize the app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',  // Corrected URL without trailing slash
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'  // Allow necessary headers
};

app.use(cors(corsOptions));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js + Express + MongoDB project!');
});

app.use('/api/auth', require('./routes/auth'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
